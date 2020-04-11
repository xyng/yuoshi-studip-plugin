<?php
namespace Xyng\Yuoshi\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;

class Packages extends SchemaProvider
{
    const TYPE = 'packages';
    protected $resourceType = self::TYPE;

    /**
     * @inheritDoc
     */
    public function getId($resource)
    {
        return $resource->getId($resource);
    }

    /**
     * @inheritDoc
     */
    public function getAttributes($resource)
    {
        return [
            'slug' => $resource->slug,
            'title' => $resource->title,
            'playable' => $resource->playable,
            'progress' => $resource->isAdditionalField('progress') ? (float) $resource->progress : null,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        $tasks = null;
        if ($includeRelationships['tasks'] ?? null) {
            $tasks = $resource->tasks;
        }

        return [
            'tasks' => [
                self::DATA => $tasks,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'tasks')
                ],
            ]
        ];
    }
}
