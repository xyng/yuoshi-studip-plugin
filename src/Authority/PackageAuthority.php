<?php
namespace Xyng\Yuoshi\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\Packages;

class PackageAuthority implements AuthorityInterface {
    public static function canEditPackage(User $user, Packages $package) {
        return $GLOBALS['perm']->have_studip_perm('dozent', $package->course_id, $user->id);
    }

    public static function canSeePackage(User $user, Packages $package) {
        return $GLOBALS['perm']->have_studip_perm('user', $package->course_id, $user->id);
    }

    public static function filterByUsersCourses() {
        return "INNER JOIN seminar_user on (seminar_user.Seminar_id = yuoshi_packages.course_id and seminar_user.user_id = :user_id)";
    }

    static function getFilter(): string
    {
        return static::filterByUsersCourses();
    }

    /**
     * @inheritDoc
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return Packages::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'seminar_user.Seminar_id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return Packages::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_packages.id', $id, $user, $perms, $conditions)
        );
    }
}
