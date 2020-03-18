<?php
namespace Xyng\Yuoshi\Classes;

use Cake\Database\Driver;
use Cake\Database\Schema\BaseSchema;
use Closure;

class StudipDbDriver extends Driver\Mysql {
    public function __construct(array $config = [])
    {
        parent::__construct($config);
    }

    protected function _connect(string $dsn, array $config): bool {
        $connection = \DBManager::getInstance()->getConnection('studip');

        // apply compatibility-layer over studipPDO
        if ($connection instanceof \StudipPDO) {
            $connection = new StudipPDODecorator($connection);
            /** @var \PDO $connection */
        }

        $this->_connection = $connection;

        return true;
    }

    public function schema(): string
    {
        return "studip";
    }
}
