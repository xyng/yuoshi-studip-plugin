<?php
namespace Xyng\Yuoshi\Model;

use DateTime;
use DateTimeImmutable;
use DBManager;
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
class BaseModel extends SimpleORMap {
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
            if (!$val) {
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

    public static function findWhere(array $conditions) {
        ['sql' => $sql, 'params' => $params] = DBHelper::traverseConditions($conditions);

        return static::findBySQL($sql, $params);
    }

    public static function findOneWhere(array $conditions) {
        ['sql' => $sql, 'params' => $params] = DBHelper::traverseConditions($conditions);

        return static::findOneBySQL($sql, $params);
    }

    public static function findWithQuery(array $query) {
        ['sql' => $sql, 'params' => $params] = DBHelper::queryToSql($query);

        return static::findBySQL($sql, $params);
    }

    public static function findOneWithQuery(array $query) {
        ['sql' => $sql, 'params' => $params] = DBHelper::queryToSql($query);

        return static::findOneBySQL($sql, $params);
    }
}
