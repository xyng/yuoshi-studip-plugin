<?php
namespace Xyng\Yuoshi\Api\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;

class TaskContentQuestSolutions extends SchemaProvider {
    const TYPE = 'task_content_solutions';
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
        /** @var \Xyng\Yuoshi\Model\UserTaskContentQuestSolutions $resource */
        return [
            'is_correct' => (bool) $resource->is_correct,
            'score' => (double) $resource->score,
            'sent_solution' => (bool) $resource->sent_solution,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        /** @var \Xyng\Yuoshi\Model\UserTaskContentQuestSolutions $resource */
        $content_solution = null;
        if ($includeRelationships['content_solution'] ?? null) {
            $content_solution = $resource->content_solution;
        }

        $quest = null;
        if ($includeRelationships['quest'] ?? null) {
            $quest = $resource->quest;
        }

        $answers = null;
        if ($includeRelationships['answers'] ?? null) {
            $answers = $resource->answers;
        }

        return [
            'content_solution' => [
                self::DATA => $content_solution,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'content_solution')
                ],
            ],
            'answers' => [
                self::DATA => $answers,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'answers')
                ],
            ],
            'quest' => [
                self::DATA => $quest,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'quest')
                ],
            ],
        ];
    }
}
