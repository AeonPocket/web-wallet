var cnUtilGen = function(initConfig) {
    //var config = $.extend({}, initConfig);
    var config = initConfig;
    config.coinUnits = new JSBigInt(10).pow(config.coinUnitPlaces);

    var HASH_STATE_BYTES = 200;
    var HASH_SIZE = 32;
    var ADDRESS_CHECKSUM_SIZE = 4;
    var CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX = config.addressPrefix;
    var UINT64_MAX = new JSBigInt(2).pow(64);
    var CURRENT_TX_VERSION = 1;
    var TX_EXTRA_NONCE_MAX_COUNT = 255;
    var TX_EXTRA_TAGS = {
        PADDING: '00',
        PUBKEY: '01',
        NONCE: '02',
        MERGE_MINING: '03'
    };
    var TX_EXTRA_NONCE_TAGS = {
        PAYMENT_ID: '00'
    };
    var KEY_SIZE = 32;
    var STRUCT_SIZES = {
        GE_P3: 160,
        GE_P2: 120,
        GE_P1P1: 160,
        GE_CACHED: 160,
        EC_SCALAR: 32,
        EC_POINT: 32,
        KEY_IMAGE: 32,
        GE_DSMP: 160 * 8, // ge_cached * 8
        SIGNATURE: 64 // ec_scalar * 2
    };

    this.valid_hex = function(hex) {
        return /[0-9a-fA-F]+/.test(hex);
    };

    function hextobin(hex) {
        if (hex.length % 2 !== 0) throw "Hex string has invalid length!";
        var res = new Uint8Array(hex.length / 2);
        for (var i = 0; i < hex.length / 2; ++i) {
            res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return res;
    }
    this.hextobin = hextobin;

    function bintohex(bin) {
        var out = [];
        for (var i = 0; i < bin.length; ++i) {
            out.push(("0" + bin[i].toString(16)).slice(-2));
        }
        return out.join("");
    }

    this.sc_reduce = function(hex) {
        var input = hextobin(hex);
        if (input.length !== 64) {
            throw "Invalid input length";
        }
        var mem = Module._malloc(64);
        Module.HEAPU8.set(input, mem);
        Module.ccall('sc_reduce', 'void', ['number'], [mem]);
        var output = Module.HEAPU8.subarray(mem, mem + 64);
        Module._free(mem);
        return bintohex(output);
    };

    this.sc_reduce32 = function(hex) {
        var input = hextobin(hex);
        if (input.length !== 32) {
            throw "Invalid input length";
        }
        var mem = Module._malloc(32);
        Module.HEAPU8.set(input, mem);
        Module.ccall('sc_reduce32', 'void', ['number'], [mem]);
        var output = Module.HEAPU8.subarray(mem, mem + 32);
        Module._free(mem);
        return bintohex(output);
    };

    this.ge_scalarmult_base = function(hex) {
        var input = hextobin(hex);
        if (input.length !== 32) {
            throw "Invalid input length";
        }
        var input_mem = Module._malloc(32);
        Module.HEAPU8.set(input, input_mem);
        var ge_p3 = Module._malloc(STRUCT_SIZES.GE_P3);
        Module.ccall('ge_scalarmult_base', 'void', ['number', 'number'], [ge_p3, input_mem]);
        var output = Module.HEAPU8.subarray(ge_p3, ge_p3 + STRUCT_SIZES.GE_P3);
        Module._free(input_mem);
        Module._free(ge_p3);
        return bintohex(output);
    };

    this.ge_p3_tobytes = function(hex) {
        var input = hextobin(hex);
        if (input.length !== STRUCT_SIZES.GE_P3) {
            throw "Invalid input length";
        }
        var ge_p3 = Module._malloc(STRUCT_SIZES.GE_P3);
        Module.HEAPU8.set(input, ge_p3);
        var out_mem = Module._malloc(32);
        Module.ccall('ge_p3_tobytes', 'void', ['number', 'number'], [out_mem, ge_p3]);
        var output = Module.HEAPU8.subarray(out_mem, out_mem + 32);
        Module._free(ge_p3);
        Module._free(out_mem);
        return bintohex(output);
    };

    this.cn_fast_hash = function(input, inlen) {
        if (inlen === undefined || !inlen) {
            inlen = Math.floor(input.length / 2);
        }
        if (input.length !== inlen * 2) {
            console.log("Input length not equal to specified");
        }
        var state = this.keccak(input, inlen, HASH_STATE_BYTES);
        return state.substr(0, HASH_SIZE * 2);
    };

    this.encode_varint = function(i) {
        i = new JSBigInt(i);
        var out = '';
        // While i >= b10000000
        while (i.compare(0x80) >= 0) {
            // out.append i & b01111111 | b10000000
            out += ("0" + ((i.lowVal() & 0x7f) | 0x80).toString(16)).slice(-2);
            i = i.divide(new JSBigInt(2).pow(7));
        }
        out += ("0" + i.toJSValue().toString(16)).slice(-2);
        return out;
    };

    this.pubkeys_to_string = function(spend, view) {
        var prefix = this.encode_varint(CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX);
        var data = prefix + spend + view;
        var checksum = this.cn_fast_hash(data);
        return cnBase58.encode(data + checksum.slice(0, ADDRESS_CHECKSUM_SIZE * 2));
    };

    // Generate keypair from seed
    this.generate_keys = function(seed) {
        if (seed.length !== 64) throw "Invalid input length!";
        var sec = this.sc_reduce32(seed);
        var point = this.ge_scalarmult_base(sec);
        var pub = this.ge_p3_tobytes(point);
        return {
            'sec': sec,
            'pub': pub
        };
    };

    this.sec_key_to_pub = function(sec) {
        var point = this.ge_scalarmult_base(sec);
        var pub = this.ge_p3_tobytes(point);
        return pub;
    };

    this.keccak = function(hex, inlen, outlen) {
        var input = hextobin(hex);
        if (input.length !== inlen) {
            throw "Invalid input length";
        }
        if (outlen <= 0) {
            throw "Invalid output length";
        }
        var input_mem = Module._malloc(inlen);
        Module.HEAPU8.set(input, input_mem);
        var out_mem = Module._malloc(outlen);
        Module._keccak(input_mem, inlen | 0, out_mem, outlen | 0);
        var output = Module.HEAPU8.subarray(out_mem, out_mem + outlen);
        Module._free(input_mem);
        Module._free(out_mem);
        return bintohex(output);
    };

    this.create_address = function(seed) {
        var keys = {};
        var first;
        if (seed.length !== 64) {
            first = this.keccak(seed, seed.length / 2, 32);
        } else {
            first = seed;
        }
        keys.spend = this.generate_keys(first);
        var second = this.keccak(keys.spend.sec, 32, 32);
        keys.view = this.generate_keys(second);
        keys.public_addr = this.pubkeys_to_string(keys.spend.pub, keys.view.pub);
        return keys;
    };

    this.create_address_if_prefix = function(seed, prefix) {
        var keys = {};
        var first;
        if (seed.length !== 64) {
            first = this.keccak(seed, seed.length / 2, 32);
        } else {
            first = seed;
        }
        keys.spend = this.generate_keys(first);
        public_addr = this.pubkeys_to_string(keys.spend.pub, "");
        if (public_addr.toUpperCase().slice(0, prefix.length) != prefix.toUpperCase())
          return null;
        var second = this.keccak(keys.spend.sec, 32, 32);
        keys.view = this.generate_keys(second);
        keys.public_addr = this.pubkeys_to_string(keys.spend.pub, keys.view.pub);
        return keys;
    };

    this.create_addr_prefix = function(seed) {
        var first;
        if (seed.length !== 64) {
            first = this.keccak(seed, seed.length / 2, 32);
        } else {
            first = seed;
        }
        var spend = this.generate_keys(first);
        var prefix = this.encode_varint(CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX);
        return cnBase58.encode(prefix + spend.pub).slice(0, 44);
    };

    this.hash_to_ec = function(key) {
        if (key.length !== (KEY_SIZE * 2)) {
            throw "Invalid input length";
        }
        var h_m = Module._malloc(HASH_SIZE);
        var point_m = Module._malloc(STRUCT_SIZES.GE_P2);
        var point2_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
        var res_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var hash = hextobin(this.cn_fast_hash(key, KEY_SIZE));
        Module.HEAPU8.set(hash, h_m);
        Module.ccall("ge_fromfe_frombytes_vartime", "void", ["number", "number"], [point_m, h_m]);
        Module.ccall("ge_mul8", "void", ["number", "number"], [point2_m, point_m]);
        Module.ccall("ge_p1p1_to_p3", "void", ["number", "number"], [res_m, point2_m]);
        var res = Module.HEAPU8.subarray(res_m, res_m + STRUCT_SIZES.GE_P3);
        Module._free(h_m);
        Module._free(point_m);
        Module._free(point2_m);
        Module._free(res_m);
        return bintohex(res);
    };

    this.decode_address = function(address) {
        var dec = cnBase58.decode(address);
        var expectedPrefix = this.encode_varint(CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX);
        var prefix = dec.slice(0, expectedPrefix.length);
        if (prefix !== expectedPrefix) {
            throw "Invalid address prefix";
        }
        dec = dec.slice(expectedPrefix.length);
        var spend = dec.slice(0, 64);
        var view = dec.slice(64, 128);
        var checksum = dec.slice(128, 128 + (ADDRESS_CHECKSUM_SIZE * 2));
        var expectedChecksum = this.cn_fast_hash(prefix + spend + view).slice(0, ADDRESS_CHECKSUM_SIZE * 2);
        if (checksum !== expectedChecksum) {
            throw "Invalid checksum";
        }
        return {
            spend: spend,
            view: view
        };
    };

    // Generate a 256-bit crypto random
    this.rand_32 = function() {
        return mn_random(256);
    };

    // Generate a 128-bit crypto random
    this.rand_16 = function() {
        return mn_random(128);
    };

    this.random_keypair = function() {
        return this.generate_keys(this.rand_32());
    };

    this.generate_key_derivation = function(pub, sec) {
        if (pub.length !== 64 || sec.length !== 64) {
            throw "Invalid input length";
        }
        var pub_b = hextobin(pub);
        var sec_b = hextobin(sec);
        var pub_m = Module._malloc(KEY_SIZE);
        Module.HEAPU8.set(pub_b, pub_m);
        var sec_m = Module._malloc(KEY_SIZE);
        Module.HEAPU8.set(sec_b, sec_m);
        var ge_p3_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var ge_p2_m = Module._malloc(STRUCT_SIZES.GE_P2);
        var ge_p1p1_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
        if (Module.ccall("ge_frombytes_vartime", "bool", ["number", "number"], [ge_p3_m, pub_m]) !== 0) {
            throw "ge_frombytes_vartime returned non-zero error code";
        }
        Module.ccall("ge_scalarmult", "void", ["number", "number", "number"], [ge_p2_m, sec_m, ge_p3_m]);
        Module.ccall("ge_mul8", "void", ["number", "number"], [ge_p1p1_m, ge_p2_m]);
        Module.ccall("ge_p1p1_to_p2", "void", ["number", "number"], [ge_p2_m, ge_p1p1_m]);
        var derivation_m = Module._malloc(KEY_SIZE);
        Module.ccall("ge_tobytes", "void", ["number", "number"], [derivation_m, ge_p2_m]);
        var res = Module.HEAPU8.subarray(derivation_m, derivation_m + KEY_SIZE);
        Module._free(pub_m);
        Module._free(sec_m);
        Module._free(ge_p3_m);
        Module._free(ge_p2_m);
        Module._free(ge_p1p1_m);
        Module._free(derivation_m);
        return bintohex(res);
    };

    this.hash_to_scalar = function(buf) {
        var hash = this.cn_fast_hash(buf);
        var scalar = this.sc_reduce32(hash);
        return scalar;
    };

    this.derivation_to_scalar = function(derivation, output_index) {
        var buf = "";
        if (derivation.length !== (STRUCT_SIZES.EC_POINT * 2)) {
            throw "Invalid derivation length!";
        }
        buf += derivation;
        var enc = encode_varint(output_index);
        if (enc.length > 10 * 2) {
            throw "output_index didn't fit in 64-bit varint";
        }
        buf += enc;
        return this.hash_to_scalar(buf);
    };

    this.derive_public_key = function(derivation, out_index, pub) {
        if (derivation.length !== 64 || pub.length !== 64) {
            throw "Invalid input length!";
        }
        var derivation_m = Module._malloc(KEY_SIZE);
        var derivation_b = hextobin(derivation);
        Module.HEAPU8.set(derivation_b, derivation_m);
        var base_m = Module._malloc(KEY_SIZE);
        var base_b = hextobin(pub);
        Module.HEAPU8.set(base_b, base_m);
        var point1_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var point2_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var point3_m = Module._malloc(STRUCT_SIZES.GE_CACHED);
        var point4_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
        var point5_m = Module._malloc(STRUCT_SIZES.GE_P2);
        var derived_key_m = Module._malloc(KEY_SIZE);
        if (Module.ccall("ge_frombytes_vartime", "bool", ["number", "number"], [point1_m, base_m]) !== 0) {
            throw "ge_frombytes_vartime returned non-zero error code";
        }
        var scalar_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
        var scalar_b = hextobin(this.derivation_to_scalar(
            bintohex(Module.HEAPU8.subarray(derivation_m, derivation_m + STRUCT_SIZES.EC_POINT)), out_index));
        Module.HEAPU8.set(scalar_b, scalar_m);
        Module.ccall("ge_scalarmult_base", "void", ["number", "number"], [point2_m, scalar_m]);
        Module.ccall("ge_p3_to_cached", "void", ["number", "number"], [point3_m, point2_m]);
        Module.ccall("ge_add", "void", ["number", "number", "number"], [point4_m, point1_m, point3_m]);
        Module.ccall("ge_p1p1_to_p2", "void", ["number", "number"], [point5_m, point4_m]);
        Module.ccall("ge_tobytes", "void", ["number", "number"], [derived_key_m, point5_m]);
        var res = Module.HEAPU8.subarray(derived_key_m, derived_key_m + KEY_SIZE);
        Module._free(derivation_m);
        Module._free(base_m);
        Module._free(scalar_m);
        Module._free(point1_m);
        Module._free(point2_m);
        Module._free(point3_m);
        Module._free(point4_m);
        Module._free(point5_m);
        Module._free(derived_key_m);
        return bintohex(res);
    };

    this.derive_secret_key = function(derivation, out_index, sec) {
        if (derivation.length !== 64 || sec.length !== 64) {
            throw "Invalid input length!";
        }
        var scalar_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
        var scalar_b = hextobin(this.derivation_to_scalar(derivation, out_index));
        Module.HEAPU8.set(scalar_b, scalar_m);
        var base_m = Module._malloc(KEY_SIZE);
        Module.HEAPU8.set(hextobin(sec), base_m);
        var derived_m = Module._malloc(STRUCT_SIZES.EC_POINT);
        Module.ccall("sc_add", "void", ["number", "number", "number"], [derived_m, base_m, scalar_m]);
        var res = Module.HEAPU8.subarray(derived_m, derived_m + STRUCT_SIZES.EC_POINT);
        Module._free(scalar_m);
        Module._free(base_m);
        Module._free(derived_m);
        return bintohex(res);
    };

    // Random 32-byte ec scalar
    this.random_scalar = function() {
        var rand = this.sc_reduce(mn_random(64 * 8));
        return rand.slice(0, STRUCT_SIZES.EC_SCALAR * 2);
    };

    this.valid_keys = function(view_pub, view_sec, spend_pub, spend_sec) {
        var expected_view_pub = this.sec_key_to_pub(view_sec);
        var expected_spend_pub = this.sec_key_to_pub(spend_sec);
        return (expected_spend_pub === spend_pub) && (expected_view_pub === view_pub);
    };

    function trimRight(str, char) {
        while (str[str.length - 1] == char) str = str.slice(0, -1);
        return str;
    }

    function padLeft(str, len, char) {
        while (str.length < len) {
            str = char + str;
        }
        return str;
    }

    function assert(stmt, val) {
        if (!stmt) {
            throw "assert failed" + (val !== undefined ? ': ' + val : '');
        }
    }

    return this;
};
var cnUtil = cnUtilGen(config);