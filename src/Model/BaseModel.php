<?php
namespace Xyng\Yuoshi\Model;

use DateTime;
use DateTimeImmutable;
use SimpleORMap;

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

        return parent::store();
    }

    private static function traverseConditions(array $conditions) {
        $sql = '';
        $params = [];

        $numItems = count($conditions);
        foreach ($conditions as $field => $condition) {
            $lastItem = --$numItems == 0;

            if (is_numeric($field) && is_array($condition) || strtolower($field) == 'or' || strtolower($field) == 'and') {
                $keyword = strtolower($field) == 'or' ? " OR " : " AND ";

                if (!is_array($condition)) {
                    throw new \InvalidArgumentException($keyword . '-key expects array as value.');
                }

                ['sql' => $subSql, 'params' => $subParams] = static::traverseConditions($condition);

                $prepend = (bool) $sql;
                if ($prepend) {
                    $sql .= $keyword;
                }

                $indentedSql = preg_replace('/^/m', "\t", $subSql);
                $sql .= "(\n" . $indentedSql . "\n)";

                if (!$prepend && !$lastItem) {
                    $sql .= $keyword;
                }

                $params = array_merge($params, $subParams);
                continue;
            }

            if (is_numeric($field)) {
                $field = $condition;
                $condition = null;
            }

            $field = trim($field);
            $split = explode(' ', $field, 2);

            $special_conditions = ['or', 'and'];
            if (!($split[1] ?? false)) {
                if (in_array(strtolower($condition), $special_conditions)) {
                    $comp = "";
                } else {
                    $comp = "=";
                }
            } else {
                $comp = trim($split[1] ?? '=');
                $comp_whitelist = ['=', '>=', '<=', '>', '<', '!=', 'in', 'not in', 'is null', 'is not null'];
                if (!in_array(strtolower($comp), $comp_whitelist)) {
                    throw new \InvalidArgumentException('unknown sql comparison "' . htmlspecialchars($comp) . '"');
                }
            }

            if ($sql) {
                $sql .= " AND\n";
            }

            if (strtolower($comp) == 'is null' || strtolower($comp) == 'is not null') {
                $sql .= sprintf("%s %s", $split[0], $comp);
            } else {
                if (
                    strtolower($comp) == 'in'
                    || strtolower($comp) == 'not in'
                ) {
                    $placeholders = '(' . join(",", array_fill(0, count($condition), '?')) . ')';
                } else {
                    $placeholders = '?';
                }

                $sql .= sprintf("%s %s %s", $split[0], $comp, $placeholders);

                if (is_array($condition)) {
                    foreach ($condition as $value) {
                        $params[] = $value;
                    }
                } else {
                    $params[] = $condition;
                }
            }
        }

        return ['sql' => $sql, 'params' => $params];
    }

    public static function findWhere(array $conditions) {
        ['sql' => $sql, 'params' => $params] = static::traverseConditions($conditions);

        return static::findBySQL($sql, $params);
    }
}
