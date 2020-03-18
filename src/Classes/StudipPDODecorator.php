<?php
namespace Xyng\Yuoshi\Classes;

use StudipPDO;

class StudipPDODecorator {
    /**
     * @var StudipPDO
     */
    protected $_instance;

    public function __construct(StudipPDO $pdo) {
        $this->_instance = $pdo;
    }

    public function __get($name)
    {
        return $this->_instance->$name;
    }

    public function __set($prop, $val)
    {
        return $this->_instance->$prop = $val;
    }

    public function __call($method, $args)
    {
        if ($method == "prepare") {
            return call_user_func_array([$this, $method], $args);
        }

        return call_user_func_array([$this->_instance, $method], $args);
    }

    /**
     * Prepares a statement for execution and returns a statement object.
     *
     * @param string    SQL statement
     * @param array $driver_options
     * @return \PDOStatement object
     */
    public function prepare($statement, $driver_options = []): \PDOStatement {
        /** @var \PDOStatement|bool $prepared */
        $prepared = $this->_instance->prepareStatement($statement, $driver_options);

        if (is_bool($prepared)) {
            throw new \PDOException("could not prepare statement");
        }

        return $prepared;
    }
}
