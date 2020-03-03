<?php
namespace Xyng\Yuoshi\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;
use Xyng\Yuoshi\Model\TaskContents;

class Contents extends SchemaProvider
{
    const TYPE = 'contents';
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
     *
     * @param TaskContents $resource
     */
    public function getAttributes($resource)
    {
        return [
            'title' => $resource->title,
            'intro' => $resource->intro,
            'outro' => $resource->outro,
            'keywords' => $resource->keywords->pluck("keyword"),
            'images' => $resource->images->toArray(),
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        return [
            'quests' => [
                self::DATA => $resource->quests,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'quests')
                ],
            ],
            'keywords' => [
                self::DATA => $resource->keywords,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'keywords')
                ],
            ],
            'images' => [
                self::DATA => $resource->images,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'images')
                ],
            ]
        ];
    }
}
