<?php
/**
 * Admin Controller to expose admin APIs.
 * User: pushkar
 * Date: 1/7/18
 * Time: 9:13 PM
 */

namespace App\Http\Controllers\Admin;


use App\Services\AdminService;
use Illuminate\Http\Request;

class AdminController
{
    private $adminService;

    /**
     * AdminController constructor.
     */
    public function __construct() {
        $this->adminService = new AdminService();
    }

    public function reset(Request $request) {
        return $request->json($this->adminService->resetWallet($request));
    }
}