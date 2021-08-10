<?php
namespace Xyng\Yuoshi\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\LearningObjectives;
use Xyng\Yuoshi\Model\Packages;

class LearningObjectiveAuthority implements AuthorityInterface
{
    public static function canEditLearningObjective(User $user, Packages $package)
    {
        return $GLOBALS['perm']->have_studip_perm('dozent', $package->course_id, $user->id);
    }

    public static function canSeeObjective(User $user, Packages $package)
    {
        return $GLOBALS['perm']->have_studip_perm('user', $package->course_id, $user->id);
    }

    public static function filterByUsersPackages()
    {
        $packageJoin = PackageAuthority::filterByUsersCourses();
        return "INNER JOIN yuoshi_packages on (yuoshi_packages.id = yuoshi_learning_objectives.package_id) " . $packageJoin;
    }

    public static function getFilter(): string
    {
        return static::filterByUsersPackages();
    }

    /**
     * @inheritDoc
     */
    public static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return LearningObjectives::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_packages.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    public static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return LearningObjectives::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_learning_objectives.id', $id, $user, $perms, $conditions)
        );
    }
}
