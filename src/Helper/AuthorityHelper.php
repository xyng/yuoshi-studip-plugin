<?php
namespace Xyng\Yuoshi\Helper;

use User;

class AuthorityHelper {
    /**
     * @param string $filterSql SQL to use for filtering. This is most likely the return of static::getFilter() of your authority
     * @param string $filterField Name of the table you are querying
     * @param string|string[] $ids Ids of entities to find
     * @param User $user current user
     * @param string[] $perms (optional) required permissions
     * @param array $conditions (optional) Conditions as in BaseModel::findWithQuery
     * @return array
     */
    public static function getFilterQuery(string $filterSql, string $filterField, $ids, User $user, array $perms = [], array $conditions = []): array {
        $joinCond = [];
        if ($perms) {
            $joinCond = [
                'seminar_user.status IN' => $perms
            ];
        }

        $queryCond = is_array($ids)
            ? (
            $ids
                ? [$filterField . ' IN' => $ids]
                : []
            )
            : [$filterField => $ids];

        return [
            'joins' => [
                [
                    'sql' => $filterSql,
                    'params' => [
                        'user_id' => $user->id
                    ],
                    'conditions' => $joinCond
                ]
            ] + ($conditions['joins'] ?? []),
            'conditions' => $queryCond + ($conditions['conditions'] ?? []),
        ];
    }
}
