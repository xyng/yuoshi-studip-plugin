<?php
namespace Xyng\Yuoshi\Api\Helper;

class JsonApiDataHelper {
    /** @var array */
    protected $data;

    public function __construct(array $data) {
        $this->data = $data['data'] ?? [];
    }

    public function getAttribute(string $attribute) {
        return $this->data['attributes'][$attribute] ?? null;
    }

    public function getAttributes(array $keys = []): array {
        if (!$keys) {
            return $this->data['attributes'] ?? [];
        }

        $ret = [];
        foreach ($keys as $key) {
            $ret[$key] = $this->getAttribute($key);
        }

        return $ret;
    }

    public function getRelation(string $relation) {
        return $this->data['relationships'][$relation] ?? null;
    }

    public function getRelationId(string $relation): ?string {
        return $this->data['relationships'][$relation]['data']['id'] ?? null;
    }

    public function getRelations(array $keys = []): array {
        if (!$keys) {
            return $this->data['relationships'] ?? [];
        }

        $ret = [];
        foreach ($keys as $key) {
            $ret[$key] = $this->getRelation($key);
        }

        return $ret;
    }

    public function __get($name)
    {
        if ($attr = $this->getAttribute($name)) {
            return $attr;
        }

        if ($rel = $this->getRelation($name)) {
            return $rel;
        }

        $trace = debug_backtrace();
        trigger_error(
            'Undefined property for __get(): ' . $name .
            ' in ' . $trace[0]['file'] .
            ' line ' . $trace[0]['line'],
            E_USER_NOTICE
        );

        return null;
    }
}
