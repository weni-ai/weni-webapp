import EmojiConvertor from 'emoji-js';
import image from 'emoji-datasource/img/apple/sheets/32.png';
import 'emoji-js/lib/emoji.css';

const emoji = new EmojiConvertor();

emoji.use_sheet = true;
emoji.include_text = true;
emoji.img_sets.apple.sheet = image;

export default {
  replace(text) {
    return emoji.replace_colons(text);
  },
};
