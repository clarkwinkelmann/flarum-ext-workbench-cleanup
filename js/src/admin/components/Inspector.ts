import {ClassComponent} from 'mithril';
import app from 'flarum/admin/app';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

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

export default class Inspector implements ClassComponent {
    loading: boolean = true
    folders: {
        path: string
        extensions: {
            [key: string]: {
                vendor?: number
                node_modules?: number
            }
        }
    }[] | null = null
    cleaning: boolean = false

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

    clean(folder: string, extension: string, type: string) {
        this.cleaning = true;
        app.request<any>({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/workbench-cleanup/clean',
            body: {
                folder,
                extension,
                type,
            },
        }).then(() => {
            this.cleaning = false;
            m.redraw();
        }).catch(error => {
            this.cleaning = false;
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
            m('.WorkbenchCleanup', this.loading ? LoadingIndicator.component() : this.list()),
        ];
    }

    list() {
        if (!Array.isArray(this.folders)) {
            return m('p', 'An error occurred');
        }

        if (this.folders.length === 0) {
            return m('p', 'No workbench folders found');
        }

        return this.folders.map(folder => {
            const extensions = Object.keys(folder.extensions).sort();

            return [
                m('h3', folder.path),
                m('table', [
                    m('thead', m('tr', [
                        m('th', 'Extension'),
                        m('th', [
                            Button.component({
                                className: 'Button Button--icon',
                                icon: 'fas fa-eraser',
                                onclick: () => {
                                    if (!confirm('Delete all?')) {
                                        return;
                                    }

                                    this.clean(folder.path, '*', 'vendor');
                                },
                                loading: this.cleaning,
                            }),
                            ' vendor',
                        ]),
                        m('th', [
                            Button.component({
                                className: 'Button Button--icon',
                                icon: 'fas fa-eraser',
                                onclick: () => {
                                    if (!confirm('Delete all?')) {
                                        return;
                                    }

                                    this.clean(folder.path, '*', 'node_modules');
                                },
                                loading: this.cleaning,
                            }),
                            ' node_modules',
                        ]),
                    ])),
                    m('tbody', extensions.map(extension => {
                        const {vendor, node_modules} = folder.extensions[extension];

                        return m('tr', [
                            m('td', extension),
                            m('td', [
                                Button.component({
                                    className: 'Button Button--icon',
                                    icon: 'fas fa-eraser',
                                    onclick: () => {
                                        this.clean(folder.path, extension, 'vendor');
                                    },
                                    loading: this.cleaning,
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
                                    loading: this.cleaning,
                                    disabled: !node_modules,
                                }),
                                ' ',
                                node_modules ? format(node_modules) : m('em', 'Not found'),
                            ]),
                        ]);
                    })),
                ]),
            ];
        });
    }
}
