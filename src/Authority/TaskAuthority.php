<?php
namespace Xyng\Yuoshi\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\Tasks;

class TaskAuthority implements AuthorityInterface
{
    public static function filterByUsersPackages(): string
    {
        $stationJoin = StationAuthority::filterByUsersPackages();
        
        return "INNER JOIN yuoshi_stations on (yuoshi_stations.id = yuoshi_tasks.station_id) " . $stationJoin;
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
        return Tasks::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_stations.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    public static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return Tasks::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_tasks.id', $id, $user, $perms, $conditions)
        );
    }
}
