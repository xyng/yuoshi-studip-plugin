<?php
namespace Xyng\Yuoshi\Controller;

use PluginController;

class IndexController extends PluginController {
    public function index_action() {
        if (\Navigation::hasItem('/course/yuoshi')) {
            \Navigation::activateItem('/course/yuoshi');
        }
    }
}
