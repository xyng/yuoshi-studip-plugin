<?php
namespace Xyng\Yuoshi\Model;

use DateTime;
use DateTimeImmutable;
use DBManager;
use PDO;
use SimpleORMap;
use Xyng\Yuoshi\Helper\DBHelper;

/**
 * Class BaseModel
 * @package Xyng\Yuoshi\Model
 *
 * @property string $id
 * @property DateTime $chdate
 * @property DateTime $mkdate
 */
class BaseModel extends SimpleORMap
{
    protected $dateFields = ['mkdate', 'chdate'];
    const DB_TZ = "UTC";
    const TZ = "Europe/Berlin";

    public function __construct($id = null)
    {
        parent::__construct($id);
    }

    public function getValue($field)
    {
        $value = parent::getValue($field);

        if (in_array($field, $this->dateFields)) {
            if ($value instanceof DateTimeImmutable) {
                return $value->setTimezone(new \DateTimeZone(self::TZ));
            }

            $date = DateTimeImmutable::createFromFormat("Y-m-d H:i:s", $value, new \DateTimeZone(self::DB_TZ));

            if (!$date) {
                if ($field == 'mkdate' || $field == 'chdate') {
                    return new DateTimeImmutable("now", new \DateTimeZone(self::TZ));
                }

                return null;
            }

            // TODO: use users preferred timezone
            return $date->setTimezone(new \DateTimeZone(self::TZ));
        }

        return $value;
    }

    public function setValue($field, $value)
    {
        if (in_array($field, $this->dateFields)) {
            if (is_string($value)) {
                $value = DateTimeImmutable::createFromFormat("Y-m-d H:i:s", $value, new \DateTimeZone(self::TZ));

                if (!$value) {
                    $value = null;
                }
            }

            if ($value instanceof DateTimeImmutable) {
                $value = $value
                    ->setTimezone(new \DateTimeZone(self::DB_TZ))
                    ->format('Y-m-d H:i:s');
            }
        }

        return parent::setValue($field, $value);
    }

    public function store()
    {
        foreach ($this->dateFields as $field) {
            $val = ($this->content[$field] ?? null);

            // always update chdate when dirty model is persisted
            if ($field === 'chdate' && $this->isDirty()) {
                $val = new DateTimeImmutable();
            }

            // make sure the dates are always defined
            if (($field === 'chdate' || $field === 'mkdate') && !$val) {
                $val = new DateTimeImmutable();
            }

            if ($val instanceof DateTimeImmutable) {
                $this->content[$field] = $val
                    ->setTimezone(new \DateTimeZone(self::DB_TZ))
                    ->format('Y-m-d H:i:s');
            }
        }

        $ret = parent::store();

        if (!$ret) {
            $error_code = DBManager::get()->errorCode();
            if (!$error_code || $error_code == '00000') {
                // catch false-positives (empty result for insert - caused by saving an unmodified entity)
                return true;
            }

            return $ret;
        }

        return $ret;
    }

    public static function findWhere(array $conditions, array $fields = [])
    {
        ['sql' => $sql, 'params' => $params] = DBHelper::traverseConditions($conditions);

        return static::findBySQL($sql, $params, $fields);
    }

    public static function findOneWhere(array $conditions, array $fields = [])
    {
        ['sql' => $sql, 'params' => $params] = DBHelper::traverseConditions($conditions);

        return static::findOneBySQL($sql, $params, $fields);
    }

    public static function findWithQuery(array $query, array $fields = [])
    {
        ['sql' => $sql, 'params' => $params] = DBHelper::queryToSql($query);

        return static::findBySQL($sql, $params, $fields);
    }

    public static function findOneWithQuery(array $query, array $fields = [])
    {
        ['sql' => $sql, 'params' => $params] = DBHelper::queryToSql($query);
        // dd($sql, $params);
        xdebug_break();

        return static::findOneBySQL($sql, $params, $fields);
    }

    public static function countWithQuery(array $query)
    {
        ['sql' => $sql, 'params' => $params] = DBHelper::queryToSql($query);

        return static::countBySQL($sql, $params);
    }

    /**
     * returns array of instances of given class filtered by given sql
     * @param string $sql sql clause to use on the right side of WHERE
     * @param array $params bind params for sql clause
     * @param array $fields additional fields to select
     * @return array array of "self" objects
     */
    public static function findBySQL($sql, $params = [], $fields = [])
    {
        $db_table = static::config('db_table');
        $class = get_called_class();
        $record = new static();

        $has_join = mb_stripos($sql, 'JOIN ');
        if ($has_join === false || $has_join > 10) {
            $sql = 'WHERE ' . $sql;
        }

        $fieldsString = '';
        foreach ($fields as $alias => $sel) {
            $record->addSelectedField($alias);
            $fieldsString .= sprintf(",\n%s as `%s`", $sel, $alias);
        }

        $sql = "SELECT `" . $db_table . "`.*" . $fieldsString . "\nFROM `" . $db_table . "` " . $sql;
        $ret = array();
        $stmt = DBManager::get()->prepare($sql);
        $stmt->execute($params);
        $stmt->setFetchMode(PDO::FETCH_INTO, $record);
        $record->setNew(false);
        while ($record = $stmt->fetch()) {
            $record->applyCallbacks('after_initialize');
            $ret[] = clone $record;
        }
        return $ret;
    }

    /**
     * returns one instance of given class filtered by given sql
     * only first row of query is used
     * @param string $where sql clause to use on the right side of WHERE
     * @param array $params parameters for query
     * @param array $fields additional fields to select
     * @return SimpleORMap|NULL
     */
    public static function findOneBySQL($where, $params = [], $fields = [])
    {
        if (mb_stripos($where, 'LIMIT') === false) {
            $where .= " LIMIT 1";
        }
        $found = static::findBySQL($where, $params, $fields);
        return isset($found[0]) ? $found[0] : null;
    }

    protected function addSelectedField(string $alias)
    {
        $this->known_slots[] = $alias;

        $this->additional_fields[$alias]['set'] = function (BaseModel $model, $field, $value) {
            $model->_setAdditionalValue($field, $value);
        };

        $this->additional_fields[$alias]['get'] = function (BaseModel $model, $field) {
            return $model->_getAdditionalValue($field);
        };
    }
}
