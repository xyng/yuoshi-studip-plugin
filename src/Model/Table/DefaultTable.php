<?php
namespace Xyng\Yuoshi\Model\Table;

use Cake\ORM\Table;

class DefaultTable extends Table {
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->addBehavior('Timestamp', [
            'events' => [
                'Model.beforeSave' => [
                    'mkdate' => 'new',
                    'chdate' => 'always'
                ]
            ]
        ]);
    }

    protected function _newId(array $primary) {
        $primaryInfo = $this->getSchema()->getColumn($primary[0]);

        if ($primaryInfo['type'] == 'string' && $primaryInfo['length'] == 32) {
            // generate the id the same way as in SimpleORMap.
            // (md5-hash of uniqid with table-name prefix and more_entropy active. try until non-existent id is found)
            do {
                $id = md5(uniqid($this->_table, true));
            } while ($this->exists(['id' => $id]));

            return $id;
        }

        return parent::_newId($primary);
    }
}
