<?php
namespace Xyng\Yuoshi\Authority;

use SimpleORMap;
use User;

interface AuthorityInterface {
    static function getFilter(): string;

    /**
     * @param string[] $ids List of parent entity ids
     * @param User $user current user
     * @param string[] $perms (optional) required permissions
     * @param array $conditions (optional) Conditions as in BaseModel::findWithQuery
     * @return SimpleORMap[]
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array;

    /**
     * @param string $id Id of entity to find
     * @param User $user current user
     * @param string[] $perms (optional) required permissions
     * @param array $conditions (optional) Conditions as in BaseModel::findWithQuery
     * @return SimpleORMap|null
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap;
}
