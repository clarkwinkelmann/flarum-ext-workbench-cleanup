<?php

namespace ClarkWinkelmann\WorkbenchCleanup;

use Flarum\Http\RequestUtil;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class InspectController extends AbstractController
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        return new JsonResponse(array_map(function ($folder) {
            $out = shell_exec('cd ' . escapeshellarg($folder) . '&& du --max-depth=3');

            $extensions = [];

            foreach (explode("\n", $out) as $line) {
                if (preg_match('~^([0-9]+)\s*\./([^/]+)/(vendor|js/node_modules)$~', $line, $matches) !== 1) {
                    continue;
                }

                $extensions[$matches[2]][str_replace('js/', '', $matches[3])] = (int)$matches[1];
            }

            return [
                'path' => $folder,
                'extensions' => $extensions,
            ];
        }, $this->getWorkbenchFolders()));
    }
}
