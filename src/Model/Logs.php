<?php
namespace Xyng\Yuoshi\Model;

use SimpleORMap;

class Logs extends SimpleORMap
{
    static protected function configure($config = array())
    {
        $config['db_table'] = 'yuoshi_logs';

        parent::configure($config);
    }
}