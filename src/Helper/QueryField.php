<?php
namespace Xyng\Yuoshi\Helper;

class QueryField extends QueryExpression {
    /**
     * Can be passed as Value for Query-Conditions in DBHelper. Field will NOT be escaped. Use with care.
     *
     * @param string $field
     */
    public function __construct(string $field) {
        parent::__construct(join('.', array_map(function ($item) {
            return sprintf("`%s`", $item);
        }, explode('.', $field))));
    }
}
