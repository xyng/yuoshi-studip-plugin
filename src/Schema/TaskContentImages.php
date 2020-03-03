<?php
namespace Xyng\Yuoshi\Schema;

class TaskContentImages extends BaseSchemaProvider
{
    const TYPE = 'images';
    protected $resourceType = self::TYPE;

    /**
     * @inheritDoc
     *
     * @param \Xyng\Yuoshi\Model\TaskContentImages $resource
     */
    public function getAttributes($resource)
    {
        return [
            'title' => $resource->title,
            'meta' => $resource->meta,
            'path' => $resource->path,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }
}
