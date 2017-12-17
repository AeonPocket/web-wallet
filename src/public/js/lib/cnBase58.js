var cnBase58 = (function () {
    var b58 = {};

    var alphabet_str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    var alphabet = [];
    for (var i = 0; i < alphabet_str.length; i++) {
        alphabet.push(alphabet_str.charCodeAt(i));
    }
    var encoded_block_sizes = [0, 2, 3, 5, 6, 7, 9, 10, 11];

    var alphabet_size = alphabet.length;
    var full_block_size = 8;
    var full_encoded_block_size = 11;

    var UINT64_MAX = new JSBigInt(2).pow(64);

    function hextobin(hex) {
        if (hex.length % 2 !== 0) throw "Hex string has invalid length!";
        var res = new Uint8Array(hex.length / 2);
        for (var i = 0; i < hex.length / 2; ++i) {
            res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return res;
    }
    this.hextobin = hextobin;
    b58.hextobin = hextobin;

    function bintohex(bin) {
        var out = [];
        for (var i = 0; i < bin.length; ++i) {
            out.push(("0" + bin[i].toString(16)).slice(-2));
        }
        return out.join("");
    }
    this.bintohex = bintohex;
    b58.bintohex = bintohex;

    function strtobin(str) {
        var res = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) {
            res[i] = str.charCodeAt(i);
        }
        return res;
    }
    this.strtobin = strtobin;
    b58.strtobin = strtobin;

    function bintostr(bin) {
        var out = [];
        for (var i = 0; i < bin.length; i++) {
            out.push(String.fromCharCode(bin[i]));
        }
        return out.join("");
    }

    function uint8_be_to_64(data) {
        if (data.length < 1 || data.length > 8) {
            throw "Invalid input length";
        }
        var res = JSBigInt.ZERO;
        var twopow8 = new JSBigInt(2).pow(8);
        var i = 0;
        switch (9 - data.length) {
        case 1:
            res = res.add(data[i++]);
        case 2:
            res = res.multiply(twopow8).add(data[i++]);
        case 3:
            res = res.multiply(twopow8).add(data[i++]);
        case 4:
            res = res.multiply(twopow8).add(data[i++]);
        case 5:
            res = res.multiply(twopow8).add(data[i++]);
        case 6:
            res = res.multiply(twopow8).add(data[i++]);
        case 7:
            res = res.multiply(twopow8).add(data[i++]);
        case 8:
            res = res.multiply(twopow8).add(data[i++]);
            break;
        default:
            throw "Impossible condition";
        }
        return res;
    }

    function uint64_to_8be(num, size) {
        var res = new Uint8Array(size);
        if (size < 1 || size > 8) {
            throw "Invalid input length";
        }
        var twopow8 = new JSBigInt(2).pow(8);
        for (var i = size - 1; i >= 0; i--) {
            res[i] = num.remainder(twopow8).toJSValue();
            num = num.divide(twopow8);
        }
        return res;
    }

    b58.encode_block = function (data, buf, index) {
        if (data.length < 1 || data.length > full_encoded_block_size) {
            throw "Invalid block length: " + data.length;
        }
        var num = uint8_be_to_64(data);
        var i = encoded_block_sizes[data.length] - 1;
        // while num > 0
        while (num.compare(0) === 1) {
            var div = num.divRem(alphabet_size);
            // remainder = num % alphabet_size
            var remainder = div[1];
            // num = num / alphabet_size
            num = div[0];
            buf[index + i] = alphabet[remainder.toJSValue()];
            i--;
        }
        return buf;
    };

    b58.encode = function (hex) {
        var data = hextobin(hex);
        if (data.length === 0) {
            return "";
        }
        var full_block_count = Math.floor(data.length / full_block_size);
        var last_block_size = data.length % full_block_size;
        var res_size = full_block_count * full_encoded_block_size + encoded_block_sizes[last_block_size];

        var res = new Uint8Array(res_size);
        var i;
        for (i = 0; i < res_size; ++i) {
            res[i] = alphabet[0];
        }
        for (i = 0; i < full_block_count; i++) {
            res = b58.encode_block(data.subarray(i * full_block_size, i * full_block_size + full_block_size), res, i * full_encoded_block_size);
        }
        if (last_block_size > 0) {
            res = b58.encode_block(data.subarray(full_block_count * full_block_size, full_block_count * full_block_size + last_block_size), res, full_block_count * full_encoded_block_size)
        }
        return bintostr(res);
    };

    b58.decode_block = function (data, buf, index) {
        if (data.length < 1 || data.length > full_encoded_block_size) {
            throw "Invalid block length: " + data.length;
        }

        var res_size = encoded_block_sizes.indexOf(data.length);
        if (res_size <= 0) {
            throw "Invalid block size";
        }
        var res_num = new JSBigInt(0);
        var order = new JSBigInt(1);
        for (var i = data.length - 1; i >= 0; i--) {
            var digit = alphabet.indexOf(data[i]);
            if (digit < 0) {
                throw "Invalid symbol";
            }
            var product = order.multiply(digit).add(res_num);
            // if product > UINT64_MAX
            if (product.compare(UINT64_MAX) === 1) {
                throw "Overflow";
            }
            res_num = product;
            order = order.multiply(alphabet_size);
        }
        if (res_size < full_block_size && (new JSBigInt(2).pow(8 * res_size).compare(res_num) <= 0)) {
            throw "Overflow 2";
        }
        buf.set(uint64_to_8be(res_num, res_size), index);
        return buf;
    };

    b58.decode = function (enc) {
        enc = strtobin(enc);
        if (enc.length === 0) {
            return "";
        }
        var full_block_count = Math.floor(enc.length / full_encoded_block_size);
        var last_block_size = enc.length % full_encoded_block_size;
        var last_block_decoded_size = encoded_block_sizes.indexOf(last_block_size);
        if (last_block_decoded_size < 0) {
            throw "Invalid encoded length";
        }
        var data_size = full_block_count * full_block_size + last_block_decoded_size;
        var data = new Uint8Array(data_size);
        for (var i = 0; i < full_block_count; i++) {
            data = b58.decode_block(enc.subarray(i * full_encoded_block_size, i * full_encoded_block_size + full_encoded_block_size), data, i * full_block_size);
        }
        if (last_block_size > 0) {
            data = b58.decode_block(enc.subarray(full_block_count * full_encoded_block_size, full_block_count * full_encoded_block_size + last_block_size), data, full_block_count * full_block_size);
        }
        return bintohex(data);
    };

    return b58;
})();
var crc32 = (function () {
    'use strict';
    var crc32 = {};

    crc32.Utf8Encode = function (string) {
        return unescape(encodeURIComponent(string));
    };

    crc32.run = function (str) {
        var crc = new crc32.Type();
        crc.processString(str);
        return crc.checksum();
    };

    crc32.table = [
        0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035,
        249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049,
        498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639,
        325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317,
        997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443,
        901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665,
        651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303,
        671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565,
        1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059,
        2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297,
        1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223,
        1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405,
        1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995,
        1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649,
        1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015,
        1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989,
        3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523,
        3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377,
        4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879,
        4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637,
        3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859,
        3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161,
        3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815,
        3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221,
        2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371,
        2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881,
        2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567,
        2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701,
        2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035,
        2932959818, 3654703836, 1088359270, 936918000, 2847714899, 3736837829, 1202900863, 817233897,
        3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431,
        3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117
    ];
    crc32.Type = function () {
        this.rem_ = 0xFFFFFFFF;
        this.checksum = function () {
            return ((this.rem_ ^ 0xFFFFFFFF) >>> 0);
        };
        this.processString = function (str) {
            str = crc32.Utf8Encode(str);
            for (var i = 0; i < str.length; i++) {
                var byte_index = ((str.charCodeAt(i) ^ this.rem_) >>> 0) & 0xFF;
                this.rem_ = ((this.rem_ >>> 8) ^ crc32.table[byte_index]) >>> 0;
            }
        };
        return this;
    };

    return crc32;
})();