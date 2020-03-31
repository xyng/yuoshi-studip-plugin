<?php
namespace Xyng\Yuoshi\Controller;

use PluginController;

class IndexController extends PluginController {
    protected $with_session = true;
    protected $allow_nobody = false;

    public function index_action() {
        if (\Navigation::hasItem('/course/yuoshi')) {
            \Navigation::activateItem('/course/yuoshi');
        }
    }
}
