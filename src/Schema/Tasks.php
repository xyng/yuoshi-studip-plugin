<?php
namespace Xyng\Yuoshi\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;

class Tasks extends SchemaProvider
{
    const TYPE = 'tasks';
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
        /** @var \Xyng\Yuoshi\Model\Tasks $resource */
        return [
            'title' => $resource->title,
            'image' => $resource->image,
            'type' => $resource->type,
            'description' => $resource->description,
            'credits' => $resource->credits,
            'is_training' => $resource->is_training,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        return [
            'contents' => [
                self::DATA => $resource->contents,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'contents')
                ],
            ]
        ];
    }
}
