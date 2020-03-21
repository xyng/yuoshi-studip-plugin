<?php

use JsonApi\Contracts\JsonApiPlugin;
use Xyng\Yuoshi\Api\Controller\PackagesController;
use Xyng\Yuoshi\Api\Controller\TaskContentQuestAnswersController;
use Xyng\Yuoshi\Api\Controller\TaskContentQuestsController;
use Xyng\Yuoshi\Api\Controller\TaskContentsController;
use Xyng\Yuoshi\Api\Controller\TasksController;

class Yuoshi extends StudIPPlugin implements StandardPlugin, SystemPlugin, JsonApiPlugin {
    public function __construct() {
        parent::__construct();

        require_once 'vendor/autoload.php';
    }

    /**
     * Return a template (an instance of the Flexi_Template class)
     * to be rendered on the course summary page. Return NULL to
     * render nothing for this plugin.
     *
     * The template will automatically get a standard layout, which
     * can be configured via attributes set on the template:
     *
     *  title        title to display, defaults to plugin name
     *  icon_url     icon for this plugin (if any)
     *  admin_url    admin link for this plugin (if any)
     *  admin_title  title for admin link (default: Administration)
     *
     * @return object   template object to render or NULL
     */
    function getInfoTemplate($course_id)
    {
        // TODO: Implement getInfoTemplate() method.
    }

    /**
     * Return a navigation object representing this plugin in the
     * course overview table or return NULL if you want to display
     * no icon for this plugin (or course). The navigation object's
     * title will not be shown, only the image (and its associated
     * attributes like 'title') and the URL are actually used.
     *
     * By convention, new or changed plugin content is indicated
     * by a different icon and a corresponding tooltip.
     *
     * @param string $course_id course or institute range id
     * @param int $last_visit time of user's last visit
     * @param string $user_id the user to get the navigation for
     *
     * @return object   navigation item to render or NULL
     */
    function getIconNavigation($course_id, $last_visit, $user_id)
    {
        // TODO: Implement getIconNavigation() method.
    }

    /**
     * Return a navigation object representing this plugin in the
     * course overview table or return NULL if you want to display
     * no icon for this plugin (or course). The navigation object's
     * title will not be shown, only the image (and its associated
     * attributes like 'title') and the URL are actually used.
     *
     * By convention, new or changed plugin content is indicated
     * by a different icon and a corresponding tooltip.
     *
     * @param string $course_id course or institute range id
     *
     * @return array    navigation item to render or NULL
     */
    function getTabNavigation($course_id)
    {
        return [
            'yuoshi' => new Navigation(_('yUOShi'), PluginEngine::getURL($this, array(), 'index'))
        ];
    }

    /**
     * @inheritDoc
     */
    public function registerAuthenticatedRoutes(\Slim\App $app)
    {
        $app->get('/courses/{id}/packages', PackagesController::class . ':index');
        $app->post('/courses/{id}/packages', PackagesController::class . ':create');

        $app->get('/packages/{id}', PackagesController::class . ':show');

        $app->get('/packages/{id}/tasks', TasksController::class . ':index');
        $app->post('/packages/{id}/tasks', TasksController::class . ':create');

        $app->get('/tasks/{id}/contents', TaskContentsController::class . ':index');

        $app->get('/contents/{id}/quests', TaskContentQuestsController::class . ':index');

        $app->get('/quests/{id}/answers', TaskContentQuestAnswersController::class . ':index');
    }

    /**
     * @inheritDoc
     */
    public function registerUnauthenticatedRoutes(\Slim\App $app)
    {
        // TODO: Implement registerUnauthenticatedRoutes() method.
    }

    /**
     * @inheritDoc
     */
    public function registerSchemas()
    {
        return [
            \Xyng\Yuoshi\Model\Packages::class => \Xyng\Yuoshi\Schema\Packages::class,
            \Xyng\Yuoshi\Model\Tasks::class => \Xyng\Yuoshi\Schema\Tasks::class,
            \Xyng\Yuoshi\Model\TaskContents::class => \Xyng\Yuoshi\Schema\Contents::class,
            \Xyng\Yuoshi\Model\TaskContentImages::class => \Xyng\Yuoshi\Schema\TaskContentImages::class,
            \Xyng\Yuoshi\Model\TaskContentQuests::class => \Xyng\Yuoshi\Schema\Quests::class,
            \Xyng\Yuoshi\Model\TaskContentQuestAnswers::class => \Xyng\Yuoshi\Schema\Answers::class,
        ];
    }
}
