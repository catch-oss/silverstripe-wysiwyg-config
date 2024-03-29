/* @author Patrick Guiran <pguiran@linagora.com>
 * @license GNU GENERAL PUBLIC LICENSE, Version 2
 * @copyright Copyright © 2010, Linagora, Patrick Guiran <pguiran@linagora.com>
 */

/*
   Original Source: https://github.com/Tauop/tinymce_splitblockquote-plugin/blob/master/tiny_mce/plugins/splitblockquote/editor_plugin_src.js
   NOTE: Modified below by KScandrett to run with current TinyMCE
 */

var shiftKey = false;
var hasEnter = false;
tinymce.PluginManager.add("SplitBlockquote", function (ed, url) {
    ed.on("keydown", function (e) {
        var parts, i, node, bq_node, openTags, closeTags, splitToken;

        if (e.keyCode != 13 || (e.keyCode == 13 && e.shiftKey)) {
            return; /* do nothing */
        }

        // get the top-most blockquote parent node
        function getMostTopBlockquote(n, r) {
            var last_bq = null;
            while (n) {
                if (n == r) break;
                if (n.nodeName === "BLOCKQUOTE") last_bq = n;
                n = n.parentNode;
            }
            return last_bq;
        }

        function getClose(n, r) {
            // get the htnk "close-tag" of a node
            function getCloseTag(n) {
                if (n.nodeName === "FONT" && ed.settings.convert_fonts_to_spans) {
                    return "</span>";
                } else {
                    return "</" + n.nodeName.toLowerCase() + ">";
                }
            }

            var result = "";
            while (n) {
                if (n == r) break;
                result += getCloseTag(n);
                n = n.parentNode;
            }
            return result;
        }

        function getOpen(n, r) {
            // get the html "open-tag" of a node
            function getOpenTag(n) {
                var attr, copy;
                copy = n.cloneNode(false);
                copy.innerHTML = "";
                attr = ed.dom
                    .getOuterHTML(copy)
                    .replace(new RegExp("<" + copy.nodeName, "i"), "")
                    .replace(new RegExp("</" + copy.nodeName + ">", "i"), "");
                return "<" + copy.nodeName.toLowerCase() + attr;
            }

            var result = "";
            while (n) {
                if (n == r) break;
                result = getOpenTag(n) + result;
                n = n.parentNode;
            }
            return result;
        }

        node = ed.selection.getNode();
        bq_node = getMostTopBlockquote(node, ed.getBody());
        if (!bq_node)
            // we aren't in a blockquote
            return;

        /* Create an unique splitToken */
        splitToken = "_$" + new Date().getTime() + "$_";
        ed.selection.setContent(splitToken, { formar: "raw" });
        parts = ed.getContent().split(splitToken);

        /* blockquote can handle DOM tree. So we have to close
         * and open DOM element correctly, and not wildly split
         * the editor content. Plus, openTags has to keep all
         * attributes to keep makeup of DOM elements, we split.
         */
        openTags = getOpen(node, bq_node);
        closeTags = getClose(node, bq_node);

        if (ed.settings.convert_fonts_to_spans && openTags != "") {
            /* juste convert </span> to </font>
             * if <font> are converted to <span>
             * as n.nodeName returns "FONT" for <span> node :/
             * @see tinymce.Editor.-_convertFonts() for more information
             */
            (function () {
                var font_count = (openTags.match(/<font/gi) || []).length;
                for (i = 0; i < font_count; ++i) {
                    start_idx = parts[1].indexOf("</span>");
                    if (start_idx != -1) {
                        parts[1] =
                            parts[1].substring(0, start_idx) +
                            "</font>" +
                            parts[1].substring(start_idx + 7);
                    }
                }
            })();
        }

        /* Update the editor content :
         *  - part[0] : content before the selection, before split
         *  - closeTags : </tag> to close correctly html tags
         *  - </blockquote> : close the blockquote
         *  - <br id='__' /> : <br /> are converted to "<p> </p>". The id
         *                     is used to change the location of the selection (cursor)
         *  - <blockquote> : open the new blockquote
         *  - openTags : re-open splited DOM nodes correctly
         *  - part[1] : content after the selection, before split
         */
        ed.setContent(
            parts[0] +
            closeTags +
            '</blockquote><br id="__"><blockquote>' +
            openTags +
            parts[1]
        );

        /* delete empty <p>aragraphe at the end of the first blockquote
         * and at the beginnig at the second blockquote.
         * Delete id attributes to */
        function clean_node(node) {
            var node_html;
            if (node == null || node.nodeName != "P") {
                return;
            }
            node_html = node.innerHTML.trim();
            if (
                node_html == "" ||
                node_html == '<br mce_bogus="1">' ||
                node_html == "<br>"
            ) {
                ed.dom.remove(node);
            }
        }

        bq_node = ed.getBody().getElementsByTagName("blockquote");
        for (i = 0; i < bq_node.length; ++i) {
            if (bq_node[i] == null) {
                continue;
            } /* paranoiac mode */
            clean_node(bq_node[i].firstChild);
            clean_node(bq_node[i].lastChild);
            if (bq_node[i].innerHTML.trim() === "") {
                ed.dom.remove(bq_node[i]);
            }
        }

        /* get the <br id="__"> element and put cursor on it */
        node = ed.dom.get("__");
        node.removeAttribute("id");
        ed.selection.select(node);
        ed.selection.collapse(true);

        /* Don't interpret <ENTER> again, to prevent a new "<p> </p>" to be added */
        return tinymce.dom.Event.cancel(e);
    });
});
