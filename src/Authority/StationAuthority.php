<?php
namespace Xyng\Yuoshi\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\Stations;

class StationAuthority implements AuthorityInterface
{
    public static function canEditStation(User $user, Station $station)
    {
        return $GLOBALS['perm']->have_studip_perm('dozent', $station->course_id, $user->id);
    }

    public static function canSeeStation(User $user, Station $station)
    {
        return $GLOBALS['perm']->have_studip_perm('user', $station->station_id, $user->id);
    }

    public static function filterByUsersPackages()
    {
        $packageJoin = PackageAuthority::filterByUsersCourses();
        return "INNER JOIN yuoshi_packages on (yuoshi_packages.id = yuoshi_stations.package_id) " . $packageJoin;
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
        return Stations::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_stations.package_id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    public static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return Stations::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_stations.id', $id, $user, $perms, $conditions)
        );
    }
}
