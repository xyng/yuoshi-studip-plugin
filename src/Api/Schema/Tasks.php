<?php
namespace Xyng\Yuoshi\Api\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;
use Xyng\Yuoshi\Helper\PermissionHelper;
use TaskSolutions;

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
            'sort' => (int) $resource->sort,
            'title' => $resource->title,
            'image' => $resource->image,
            'kind' => $resource->kind,
            'description' => $resource->description,
            'credits' => (int) $resource->credits,
            'is_training' => (bool) $resource->is_training,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        $contents = null;
        if ($includeRelationships['contents'] ?? null) {
            $contents = $resource->contents;
        }

        return [
            'contents' => [
                self::DATA => $contents,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'contents')
                ],
            ],
        ];
    }
}
