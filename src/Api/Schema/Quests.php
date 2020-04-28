<?php
namespace Xyng\Yuoshi\Api\Schema;

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
            'multiple' => (bool) $resource->multiple,
            'require_order' => (bool) $resource->require_order,
            'custom_answer' => (bool) $resource->custom_answer,
            'sort' => $resource->sort ? (int) $resource->sort : null,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        $answers = null;
        if ($includeRelationships['answers'] ?? null) {
            $answers = $resource->answers;
        }

        return [
            'answers' => [
                self::DATA => $answers,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'answers')
                ],
            ]
        ];
    }
}
