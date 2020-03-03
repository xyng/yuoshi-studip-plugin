<?php
namespace Xyng\Yuoshi\Schema;

class TaskContentKeywords extends BaseSchemaProvider
{
    const TYPE = 'keywords';
    protected $resourceType = self::TYPE;

    /**
     * @inheritDoc
     *
     * @param \Xyng\Yuoshi\Model\TaskContentKeywords $resource
     */
    public function getAttributes($resource)
    {
        return [
            'keyword' => $resource->keyword,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }
}
