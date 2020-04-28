<?php
namespace Xyng\Yuoshi\Api\Schema;

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
            'content' => $resource->content,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        $quests = null;
        if ($includeRelationships['quests'] ?? null) {
            $quests = $resource->quests;
        }

        return [
            'quests' => [
                self::DATA => $quests,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'quests')
                ],
            ],
        ];
    }
}
