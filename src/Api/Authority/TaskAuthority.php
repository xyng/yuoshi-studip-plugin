<?php
namespace Xyng\Yuoshi\Api\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\Tasks;

class TaskAuthority implements AuthorityInterface {
    public static function filterByUsersPackages(): string {
        $packageJoin = PackageAuthority::filterByUsersCourses();
        return "INNER JOIN yuoshi_packages on (yuoshi_packages.id = yuoshi_tasks.package_id) " . $packageJoin;
    }

    static function getFilter(): string
    {
        return static::filterByUsersPackages();
    }

    /**
     * @inheritDoc
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return Tasks::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_packages.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return Tasks::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_tasks.id', $id, $user, $perms, $conditions)
        );
    }
}
