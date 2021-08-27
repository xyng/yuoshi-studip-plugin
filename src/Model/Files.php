<?php
declare(strict_types=1);

namespace Xyng\Yuoshi\Model;

use FileRef;

/**
 * Class Files
 * @package Xyng\Yuoshi\Model
 *
 * @property string $fk_model The Model Class this file belongs to
 * @property string $fk_key The Id of the Model this file belongs to
 * @property string $fk_group The File Group for this ref in the model
 * @property string $file_id Id to file ref
 * @property FileRef $file
 */
class Files extends BaseModel {
    protected static function configure($config = [])
    {
        $config['db_table'] = 'yuoshi_files';

        $config['belongs_to']['file'] = [
            'class_name' => FileRef::class,
            'foreign_key' => 'file_id'
        ];

        parent::configure($config);
    }

    /**
     * @param string $model FQCN of related class
     * @param string $id ID of related entity
     * @param string|null $group
     * @return array
     */
    public static function getByForeign($model, $id, $group) {
        $conditions = [
            'fk_model' => $model,
            'fk_key' => $id,
        ];

        if ($group !== null) {
            $conditions['fk_group'] = $group;
        }

        return self::findWhere($conditions);
    }

    /**
     * @param self $entity
     * @param string[] $params Array in shape ['MODEL FQDN', 'ENTITY ID', 'GROUP']
     * @return Files
     */
    public static function setForeign($entity, $params) {
        $entity->fk_model = $params[0];
        $entity->fk_key = $params[1];
        $entity->fk_group = $params[2] ?? null;

        return $entity;
    }

    /**
     * @param FileRef $ref
     *
     * @return self
     */
    public static function buildForRef($ref) {
        return self::build([
            'file_id' => $ref->id,
        ]);
    }
}
