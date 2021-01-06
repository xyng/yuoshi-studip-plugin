<?php
namespace Xyng\Yuoshi\Helper;

class QueryExpression {
    /**
     * @var string
     */
    private $expr;

    /**
     * Can be passed as Value for Query-Conditions in DBHelper. Expr will NOT be escaped. Use with care.
     *
     * @param string $expr
     */
    public function __construct(string $expr) {
        $this->expr = $expr;
    }

    /**
     * @return string
     */
    public function getExpr(): string
    {
        return $this->expr;
    }
}
