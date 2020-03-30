<?php
namespace Xyng\Yuoshi\Helper;

class DBHelper {
    static function arrayToPlaceholderAndValue(array $arr, string $prefix): array {
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
}
