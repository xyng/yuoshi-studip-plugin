<?php
namespace Xyng\Yuoshi\Model;

use DateTime;
use DateTimeImmutable;
use SimpleORMap;

/**
 * Class BaseModel
 * @package Xyng\Yuoshi\Model
 *
 * @property DateTime $chdate
 * @property DateTime $mkdate
 */
class BaseModel extends SimpleORMap {
    protected $dateFields = ['mkdate', 'chdate'];

    public function __construct($id = null)
    {
        parent::__construct($id);
    }

    public function getValue($field)
    {
        $value = parent::getValue($field);

        if (in_array($field, $this->dateFields)) {
            $date = DateTimeImmutable::createFromFormat("Y-m-d H:i:s", $value);

            if (!$date) {
                return null;
            }

            return $date;
        }

        return $value;
    }
}
