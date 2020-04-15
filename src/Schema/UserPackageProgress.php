<?php
namespace Xyng\Yuoshi\Schema;

use JsonApi\Schemas\SchemaProvider;

class UserPackageProgress extends SchemaProvider {
    const TYPE = 'packageProgress';
    protected $resourceType = self::TYPE;

    /**
     * @param \Xyng\Yuoshi\Model\UserPackageProgress $resource
     * @param bool $isPrimary
     * @param array $includeRelationships
     * @return array
     */
    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        if (!$resource->isAdditionalField('user_id')) {
            return [];
        }

        $user = null;
        if (($includeRelationships['user'] ?? null)) {
            $user = $resource->user;
        }

        return [
            'user' => [
                self::DATA => $user,
            ],
        ];
    }

    /**
     * @inheritDoc
     */
    public function getId($resource)
    {
        if ($resource->isAdditionalField('user_id')) {
            return $resource->getId() . '_' . $resource->user_id;
        }
        return $resource->getId();
    }

    /**
     * @inheritDoc
     */
    public function getAttributes($resource)
    {
        return [
            'progress' => $resource->isAdditionalField('progress') ? (float) $resource->progress : null,
        ];
    }
}
