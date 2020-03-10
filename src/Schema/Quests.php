<?php
namespace Xyng\Yuoshi\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;

class Quests extends SchemaProvider
{
    const TYPE = 'quests';
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
            'name' => $resource->name,
            'image' => $resource->image,
            'prePhrase' => $resource->prePhrase,
            'question' => $resource->question,
            'content' => $resource->content,
            'multiple' => (bool) $resource->multiple,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        return [
            'answers' => [
                self::DATA => $resource->answers,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'quests')
                ],
            ]
        ];
    }
}
