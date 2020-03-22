<?php
namespace Xyng\Yuoshi\Controller;

use Context;
use PluginController;
use Xyng\Yuoshi\Model\Packages;
use Xyng\Yuoshi\Model\Tasks;

class IndexController extends PluginController {
    public function index_action() {
        if (\Navigation::hasItem('/course/yuoshi')) {
            \Navigation::activateItem('/course/yuoshi');
        }
    }
}
