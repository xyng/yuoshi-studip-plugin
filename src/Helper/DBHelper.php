<?php
namespace Xyng\Yuoshi\Helper;

class DBHelper {
    public static function arrayToPlaceholderAndValue(array $arr, string $prefix): array {
        if (count($arr) === 0) {
            throw new \Error("Array must contain items.");
        }

        $placeholders = [];
        $values = [];
        foreach ($arr as $key => $value) {
            $placeholder = $prefix . "_" . $key;
            $placeholders[] = ':' . $placeholder;

            $values[$placeholder] = $value;
        }

        $placeholder = sprintf("(%s)", join(",", $placeholders));

        return [
            'placeholder' => $placeholder,
            'values' => $values
        ];
    }

    public static function traverseConditions(array $conditions): array {
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

            $fieldName = $split[0];

            if (strtolower($comp) == 'is null' || strtolower($comp) == 'is not null') {
                $sql .= sprintf("%s %s", $fieldName, $comp);
            } else {
                $placeholder_key = preg_replace('/[^\w]/', '_', $fieldName);
                if (
                    strtolower($comp) == 'in'
                    || strtolower($comp) == 'not in'
                ) {
                    ['placeholder' => $placeholder, 'values' => $values] = DBHelper::arrayToPlaceholderAndValue($condition, $placeholder_key);
                    $params += $values;
                } else {
                    $placeholder = ':' . $placeholder_key;
                    $params[$placeholder_key] = $condition;
                }

                $sql .= sprintf("%s %s %s", $fieldName, $comp, $placeholder);
            }
        }

        return ['sql' => $sql, 'params' => $params];
    }

    public static function queryToSql(array $query): array {
        $sql = '';
        $params = [];

        $join_conditions = [];
        if ($joins = $query['joins'] ?? []) {
            foreach ($joins as $key => $join) {
                $sql .= "\n" . $join['sql'];
                $params += $join['params'] ?? [];

                $join_conditions += $join['conditions'] ?? [];
            }
        }

        $conditions = $query['conditions'] ?? [];
        if ($join_conditions || $conditions) {
            $sql .= "\nWHERE\n";
            ['sql' => $cond_sql, 'params' => $cond_params] = static::traverseConditions($join_conditions + $conditions);
            $sql .= $cond_sql;
            $params += $cond_params;
        }

        return ['sql' => $sql, 'params' => $params];
    }
}
