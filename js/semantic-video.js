function n(t) {
    return t && t.__esModule ? t.default : t
}

var _jquery = jQuery;
var _i18n = i18n;
var _react = React;
var _reactDom = ReactDom;
var _Injector = Injector;
var _InsertMediaModal = n(InsertMediaModal);
var _InsertEmbedModal = n(InsertEmbedModal);
var _ShortcodeSerialiser = n(ShortcodeSerialiser);
var InjectableInsertMediaModal = _Injector.loadComponent(_InsertMediaModal);

/* global tinymce, window */
var InjectableInsertEmbedModal = _Injector.loadComponent(_InsertEmbedModal);
var semanticvideofilter =

    'figure[data-shortcode="semanticvideo"]';
/**
 * Embed shortcodes are split into an outer <div> element and an inner <img>
 * placeholder based on the thumbnail url provided by the osemanticvideo shortcode provider.
 */

(function () {
    var semanticvideo = {
        init: function init(editor) {
            var insertTitle = i18n._t('AssetAdmin.INSERT_VIA_URL', 'Insert media via URL');

            var editTitle = i18n._t('AssetAdmin.EDIT_MEDIA', 'Edit media');

            var contextTitle = i18n._t('AssetAdmin.MEDIA', 'Media');

            editor.addButton('semanticvideo', {
                title: insertTitle,
                icon: 'media',
                cmd: 'semanticvideo',
                stateSelector: semanticvideofilter
            });
            editor.addMenuItem('semanticvideo', {
                text: contextTitle,
                icon: 'media',
                cmd: 'semanticvideo'
            });
            editor.addButton('semanticvideoedit', {
                title: editTitle,
                icon: 'editimage',
                cmd: 'semanticvideo'
            });
            editor.addContextToolbar(function (semanticvideo) {
                return editor.dom.is(semanticvideo, semanticvideofilter);
            }, 'alignleft aligncenter alignright | semanticvideoedit');
            editor.addCommand('semanticvideo', function () {
                // See HtmlEditorField.js
                (0, _jquery)("#".concat(editor.id)).entwine('ss').openEmbedDialog();
            }); // Replace the tinymce default media commands with the semanticvideo command

            editor.on('BeforeExecCommand', function (e) {
                var cmd = e.command;
                var ui = e.ui;
                var val = e.value;

                if (cmd === 'mceAdvMedia' || cmd === 'mceAdvMedia') {
                    e.preventDefault();
                    editor.execCommand('semanticvideo', ui, val);
                }
            });

            editor.on('SaveContent', function (o) {
                var settings = o.target.settings.wysiswg_semantic_video;

                var content = _jquery("<div>".concat(o.content, "</div>")); // Transform [semanticvideo] shortcodes

                content.find(semanticvideofilter).each(function replaceWithShortCode() {
                    // Note: semanticvideo <div> contains placeholder <img>, and potentially caption <p>
                    var semanticvideo = (0, _jquery)(this); // If placeholder has been removed, remove data-* properties and
                    // convert to non-shortcode div

                    var placeholder = semanticvideo.find('img.placeholder');

                    if (placeholder.length === 0) {
                        semanticvideo.removeAttr('data-url');
                        semanticvideo.removeAttr('data-shortcode');
                        return;
                    } // Find nested element data

                    var caption = semanticvideo.find(settings.selectors.caption).text();
                    var width = parseInt(placeholder.attr('width'), 10);
                    var height = parseInt(placeholder.attr('height'), 10);
                    var url = semanticvideo.data('url');
                    var properties = {
                        url: url,
                        thumbnail: placeholder.prop('src'),
                        class: semanticvideo.prop('class'),
                        width: isNaN(width) ? null : width,
                        height: isNaN(height) ? null : height,
                        caption: caption
                    };

                    var shortCode = _ShortcodeSerialiser.serialise({
                        name: 'semanticvideo',
                        properties: properties,
                        wrapped: true,
                        content: url
                    });

                    semanticvideo.replaceWith(shortCode);
                }); // eslint-disable-next-line no-param-reassign

                o.content = content.html();
            });
            editor.on('BeforeSetContent', function (o) {

                var settings = o.target.settings.wysiswg_semantic_video;
                var content = o.content; // Transform [semanticvideo] tag

                var match = _ShortcodeSerialiser.match('semanticvideo', true, content);

                while (match) {
                    var data = match.properties; // Add base div

                    var replacerbits = {
                        'classes': data.class,
                        'data-shortcode': 'semanticvideo',
                        'video': '<img src="' + data.thumbnail + '" class="placeholder" />',
                        'data-url': data.url,
                        'caption': data.caption ? data.caption : ''
                    };

                    var base = settings.template.replace(/\{\{\s*(\S*)\s*\}\}/g, function (a, b) {
                        return replacerbits[b] ? replacerbits[b] : '';
                    });

                    base = _jquery(base);

                    // var base = (0, _jquery)('<div/>').attr('data-url', data.url || match.content).attr('data-shortcode', 'semanticvideo').addClass(data.class).addClass('ss-htmleditorfield-file semanticvideo'); // Add placeholder

                    // var placeholder = (0, _jquery)('<img />').attr('src', data.thumbnail).addClass('placeholder'); // Set dimensions

                    // if (data.width) {
                    //     placeholder.attr('width', data.width);
                    // }

                    // if (data.height) {
                    //     placeholder.attr('height', data.height);
                    // }

                    // base.append(placeholder); // Add caption p tag

                    // if (data.caption) {
                    //     var caption = (0, _jquery)('<p />').addClass('caption').text(data.caption);
                    //     base.append(caption);
                    // } // Inject into code

                    content = content.replace(match.original, (0, _jquery)('<div/>').append(base).html()); // Search for next match

                    match = _ShortcodeSerialiser.match('semanticvideo', true, content);
                } // eslint-disable-next-line no-param-reassign

                o.content = content;
            });
        }
    };
    tinymce.PluginManager.add('semanticvideo', function (editor) {
        return semanticvideo.init(editor);
    });
})();

_jquery.entwine('ss', function ($) {
    $('.js-injector-boot #insert-embed-react__dialog-wrapper').entwine({
        Element: null,
        Data: {},
        onunmatch: function onunmatch() {
            // solves errors given by ReactDOM "no matched root found" error.
            this._clearModal();
        },
        _clearModal: function _clearModal() {
            ReactDom.unmountComponentAtNode(this[0]); // this.empty();

        },
        open: function open() {
            this._renderModal(true);
        },
        close: function close() {
            this.setData({});

            this._renderModal(false);
        },

        /**
         * Renders the react modal component
         *
         * @param {boolean} isOpen
         * @private
         */
        _renderModal: function _renderModal(isOpen) {
            var _this = this;

            var handleHide = function handleHide() {
                return _this.close();
            }; // Inserts semanticvideo into page

            var handleInsert = function handleInsert() {
                return _this._handleInsert.apply(_this, arguments);
            }; // Create edit form from url

            var handleCreate = function handleCreate() {
                return _this._handleCreate.apply(_this, arguments);
            };

            var handleLoadingError = function handleLoadingError() {
                return _this._handleLoadingError.apply(_this, arguments);
            };

            var attrs = this.getOriginalAttributes(); // create/update the react component

            ReactDom.render(React.createElement(InjectableInsertEmbedModal, {
                isOpen: isOpen,
                onCreate: handleCreate,
                onInsert: handleInsert,
                onClosed: handleHide,
                onLoadingError: handleLoadingError,
                bodyClassName: "modal__dialog",
                className: "insert-embed-react__dialog-wrapper",
                fileAttributes: attrs
            }), this[0]);
        },
        _handleLoadingError: function _handleLoadingError() {
            this.setData({});
            this.open();
        },

        /**
         * Handles inserting the selected file in the modal
         *
         * @param {object} data
         * @returns {Promise}
         * @private
         */
        _handleInsert: function _handleInsert(data) {
            var oldData = this.getData();
            this.setData(Object.assign({
                Url: oldData.Url
            }, data));
            this.insertRemote();
            this.close();
        },
        _handleCreate: function _handleCreate(data) {
            this.setData(Object.assign({}, this.getData(), data));
            this.open();
        },

        /**
         * Find the selected node and get attributes associated to attach the data to the form
         *
         * @returns {object}
         */
        getOriginalAttributes: function getOriginalAttributes() {
            var data = this.getData();
            var $field = this.getElement();

            if (!$field) {
                return data;
            }

            var node = $($field.getEditor().getSelectedNode());

            if (!node.length) {
                return data;
            } // Find root semanticvideo shortcode

            var element = node.closest(semanticvideofilter).add(node.filter(semanticvideofilter));

            if (!element.length) {
                return data;
            }

            var image = element.find('img.placeholder'); // If image has been removed then this shortcode is invalid

            if (image.length === 0) {
                return data;
            }

            var caption = element.find('.caption').text();
            var width = parseInt(image.width(), 10);
            var height = parseInt(image.height(), 10);
            return {
                Url: element.data('url') || data.Url,
                CaptionText: caption,
                PreviewUrl: image.attr('src'),
                Width: isNaN(width) ? null : width,
                Height: isNaN(height) ? null : height,
                Placement: this.findPosition(element.prop('class'))
            };
        },

        /**
         * Calculate placement from css class
         */
        findPosition: function findPosition(cssClass) {
            var alignments = ['leftAlone', 'center', 'rightAlone', 'left', 'right'];

            if (typeof cssClass !== 'string') {
                return '';
            }

            var classes = cssClass.split(' ');
            return alignments.find(function (alignment) {
                return classes.indexOf(alignment) > -1;
            });
        },
        insertRemote: function insertRemote() {
            var $field = this.getElement();

            if (!$field) {
                return false;
            }

            var editor = $field.getEditor();

            if (!editor) {
                return false;
            }

            var settings = editor.getConfig().wysiswg_semantic_video;
            var data = this.getData(); // Add base div
            // var placeholder = _jquery('<img />').attr('src', data.PreviewUrl).addClass('placeholder');

            var replacerbits = {
                'classes': 'ss-htmleditorfield-file semanticvideo embed',
                'data-shortcode': 'semanticvideo',
                'video': '<img src="' + data.PreviewUrl + '" class="placeholder" />',
                'data-url': data.Url,
                'caption': data.CaptionText ? data.CaptionText : ''
            };

            var base = settings.template.replace(/\{\{\s*(\S*)\s*\}\}/g, function (a, b) {
                return replacerbits[b] ? replacerbits[b] : '';
            });

            base = $(base);

            // container.find('img').addClass("ss-htmleditorfield-file semanticvideo");

            // var base = (0, _jquery)('<div/>').attr('data-url', data.Url).attr('data-shortcode', 'semanticvideo').addClass(data.Placement).addClass('ss-htmleditorfield-file semanticvideo'); // Add placeholder image

            // var placeholder = (0, _jquery)('<img />').attr('src', data.PreviewUrl).addClass('placeholder'); // Set dimensions

            // if (data.Width) {
            //     placeholder.attr('width', data.Width);
            // }

            // if (data.Height) {
            //     placeholder.attr('height', data.Height);
            // } // Add to base

            // base.append(placeholder); // Add caption p tag

            // if (data.CaptionText) {
            //     var caption = (0, _jquery)('<p />').addClass('caption').text(data.CaptionText);
            //     base.append(caption);
            // } // Find best place to put this semanticvideo

            var node = $(editor.getSelectedNode());
            var replacee = $(null);

            if (node.length) {
                replacee = node.filter(semanticvideofilter); // Find find closest existing semanticvideo

                if (replacee.length === 0) {
                    replacee = node.closest(semanticvideofilter);
                } // Fail over to check if the node is an image

                if (replacee.length === 0) {
                    replacee = node.filter('img.placeholder');
                }
            } // Inject

            if (replacee.length) {
                replacee.replaceWith(base);
            } else {
                // Otherwise insert the whole HTML content
                editor.repaint();
                editor.insertContent($('<div />').append(base.clone()).html(), {
                    skip_undo: 1
                });
            }

            editor.addUndo();
            editor.repaint();
            return true;
        }
    });
});
