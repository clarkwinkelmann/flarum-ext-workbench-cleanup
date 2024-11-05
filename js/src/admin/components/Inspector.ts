import {ClassComponent} from 'mithril';
import app from 'flarum/admin/app';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Dropdown from 'flarum/common/components/Dropdown';

function format(value: number) {
    if (value > 1000000000) {
        return Math.round(value / 1000000000) + 'GB';
    }

    if (value > 1000000) {
        return Math.round(value / 1000000) + 'MB';
    }

    if (value > 1000) {
        return Math.round(value / 1000) + 'kB';
    }

    return value + 'B';
}

type ExtensionMetric = 'vendor' | 'node_modules' | 'git' | 'total';

type SortOption = 'alpha' | ExtensionMetric;

type SortOptions = {
    [key in SortOption]: string;
};

type ExtensionMetrics = {
    [key in ExtensionMetric]: number;
};

const SORT_OPTIONS: SortOptions = {
    alpha: 'Alphabetically',
    vendor: 'Vendor size',
    node_modules: 'Node size',
    git: 'Git size',
    total: 'Total size',
};

function toggleArrayValue<T>(array: T[], value: T, enable: boolean = false) {
    const index = array.indexOf(value);

    if (enable) {
        if (index === -1) {
            array.push(value);
        }
    } else if (index !== -1) {
        array.splice(index, 1);
    }
}

export default class Inspector implements ClassComponent {
    loading: boolean = true
    folders: {
        path: string
        extensions: {
            [key: string]: ExtensionMetrics
        }
    }[] | null = null
    cleaningExtension: string[] = []
    cleaningType: ExtensionMetric[] = []
    sort: SortOption = 'alpha'

    refresh() {
        this.loading = true;
        this.folders = null;
        app.request<any>({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/workbench-cleanup/inspect',
        }).then(response => {
            this.folders = response;
            this.loading = false;
            m.redraw();
        }).catch(error => {
            this.loading = false;
            m.redraw();
            throw error;
        });
    }

    clean(folder: string, extension: string, type: ExtensionMetric) {
        toggleArrayValue(this.cleaningExtension, extension, true);
        toggleArrayValue(this.cleaningType, type, true);

        app.request<{
            deleted: { folder: string, extension: string, type: ExtensionMetric }[]
        }>({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/workbench-cleanup/clean',
            body: {
                folder,
                extension,
                type,
            },
        }).then(result => {
            // Update local state for deleted content
            if (result && Array.isArray(result.deleted) && this.folders) {
                result.deleted.forEach(deleted => {
                    this.folders!.forEach(folder => {
                        if (folder.path !== deleted.folder) {
                            return;
                        }

                        Object.keys(folder.extensions).forEach(extension => {
                            if (extension !== deleted.extension) {
                                return;
                            }

                            if (!folder.extensions[extension][deleted.type]) {
                                return;
                            }

                            folder.extensions[extension].total -= folder.extensions[extension][deleted.type]!;
                            delete folder.extensions[extension][deleted.type];
                        });
                    });
                });
            }

            toggleArrayValue(this.cleaningExtension, extension, false);
            toggleArrayValue(this.cleaningType, type, false);
            m.redraw();
        }).catch(error => {
            toggleArrayValue(this.cleaningExtension, extension, false);
            toggleArrayValue(this.cleaningType, type, false);
            m.redraw();
            throw error;
        });
    }

    oninit() {
        this.refresh();
    }

    view() {
        return [
            Button.component({
                className: 'Button',
                onclick: () => {
                    this.refresh();
                },
                disabled: this.loading,
            }, 'Refresh'),
            ' ',
            Dropdown.component({
                label: 'Sort: ' + SORT_OPTIONS[this.sort],
                buttonClassName: 'Button',
            }, (Object.keys(SORT_OPTIONS) as SortOption[]).map(option => {
                return Button.component({
                    onclick: () => {
                        this.sort = option;
                    },
                }, SORT_OPTIONS[option]);
            })),
            m('.WorkbenchCleanup', this.loading ? LoadingIndicator.component() : this.list()),
        ];
    }

    isLoading(extension: string, type: ExtensionMetric) {
        return (this.cleaningExtension.includes(extension) || this.cleaningExtension.includes('*')) && this.cleaningType.includes(type);
    }

    list() {
        if (!Array.isArray(this.folders)) {
            return m('p', 'An error occurred');
        }

        if (this.folders.length === 0) {
            return m('p', 'No workbench folders found');
        }

        return this.folders.map(folder => {
            const extensions = Object.keys(folder.extensions).sort((a, b) => {
                if (this.sort === 'alpha') {
                    return a > b ? 1 : -1;
                }

                return (folder.extensions[a][this.sort] || 0) > (folder.extensions[b][this.sort] || 0) ? -1 : 1;
            });

            let totalCode = 0;
            let totalVendor = 0;
            let totalNode = 0;
            let totalGit = 0;

            const rows = extensions.map(extension => {
                const {total, vendor, node_modules, git} = folder.extensions[extension];

                const codeSize = total - (vendor || 0) - (node_modules || 0) - (git || 0);

                totalCode += codeSize;
                totalVendor += vendor || 0;
                totalNode += node_modules || 0;
                totalGit += git || 0;

                return m('tr', [
                    m('td', extension),
                    m('td', [
                        Button.component({
                            className: 'Button Button--icon',
                            icon: 'fas fa-eraser',
                            onclick: () => {
                                this.clean(folder.path, extension, 'vendor');
                            },
                            loading: this.isLoading(extension, 'vendor'),
                            disabled: !vendor,
                        }),
                        ' ',
                        vendor ? format(vendor) : m('em', 'Not found'),
                    ]),
                    m('td', [
                        Button.component({
                            className: 'Button Button--icon',
                            icon: 'fas fa-eraser',
                            onclick: () => {
                                this.clean(folder.path, extension, 'node_modules');
                            },
                            loading: this.isLoading(extension, 'node_modules'),
                            disabled: !node_modules,
                        }),
                        ' ',
                        node_modules ? format(node_modules) : m('em', 'Not found'),
                    ]),
                    m('td', git ? format(git) : m('em', 'Not found')),
                    m('td', format(codeSize)),
                    m('td', format(total)),
                ]);
            });

            return [
                m('h3', folder.path),
                m('table', [
                    m('thead', [
                            m('tr', [
                                m('th', 'Extension'),
                                m('th', 'vendor'),
                                m('th', 'node_modules'),
                                m('th', 'git'),
                                m('th', 'code'),
                                m('th', 'everything'),
                            ]),
                            m('tr', [
                                m('th', 'Total'),
                                m('th', [
                                    Button.component({
                                        className: 'Button Button--icon',
                                        icon: 'fas fa-eraser',
                                        onclick: (event: MouseEvent) => {
                                            if (!event.shiftKey && !confirm('Delete all vendor folders in ' + folder.path + '')) {
                                                return;
                                            }

                                            this.clean(folder.path, '*', 'vendor');
                                        },
                                        loading: this.isLoading('*', 'vendor'),
                                        disabled: totalVendor === 0,
                                    }),
                                    ' ',
                                    totalVendor > 0 ? format(totalVendor) : m('em', 'None found'),
                                ]),
                                m('th', [
                                    Button.component({
                                        className: 'Button Button--icon',
                                        icon: 'fas fa-eraser',
                                        onclick: (event: MouseEvent) => {
                                            if (!event.shiftKey && !confirm('Delete all node_modules folders in ' + folder.path + '')) {
                                                return;
                                            }

                                            this.clean(folder.path, '*', 'node_modules');
                                        },
                                        loading: this.isLoading('*', 'node_modules'),
                                        disabled: totalNode === 0,
                                    }),
                                    ' ',
                                    totalNode > 0 ? format(totalNode) : m('em', 'None found'),
                                ]),
                                m('th', format(totalGit)),
                                m('th', format(totalCode)),
                                m('th', format(totalCode + totalVendor + totalNode + totalGit)),
                            ]),
                        ],
                    ),
                    m('tbody', rows),
                ]),
            ];
        });
    }
}
