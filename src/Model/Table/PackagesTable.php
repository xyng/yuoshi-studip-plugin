<?php
namespace Xyng\Yuoshi\Model\Table;

class PackagesTable extends DefaultTable {
    public function initialize(array $config): void {
        parent::initialize($config);

        $this->setTable("yuoshi_packages");
    }
}
