import { parserReply } from '../commons';
import Parser from '../parser';
import alias from '../systems/alias';
import customcommands from '../systems/customcommands';

import type { ResponseFilter } from '.';

import { getCountOfCommandUsage } from '~/helpers/commands/count';
import { debug, error } from '~/helpers/log';

const command: ResponseFilter = {
  '$count(\'#\')': async function (filter: string) {
    const countRegex = new RegExp('\\$count\\(\\\'(?<command>\\!\\S*)\\\'\\)', 'gm');
    const match = countRegex.exec(filter);
    if (match && match.groups) {
      return String(await getCountOfCommandUsage(match.groups.command));
    }
    return '0';
  },
  '$count': async function (_variable, attr) {
    if (attr.command) {
      return String((await getCountOfCommandUsage(attr.command)));
    }
    return '0';
  },
  '(!!#)': async function (filter: string, attr) {
    const cmd = filter
      .replace('!', '') // replace first !
      .replace(/\(|\)/g, '')
      .replace(/\$param/g, attr.param ?? '');
    debug('message.process', cmd);

    // check if we already checked cmd
    if (!attr.processedCommands) {
      attr.processedCommands = [];
    }
    if (attr.processedCommands.includes(cmd)) {
      error(`Response ${filter} seems to be in loop! ${attr.processedCommands.join('->')}->${attr.command}`);
      debug('message.error', `Response ${filter} seems to be in loop! ${attr.processedCommands.join('->')}->${attr.command}`);
      return '';
    } else {
      attr.processedCommands.push(attr.command);
    }

    // run custom commands
    if (customcommands.enabled) {
      await customcommands.run({
        sender: (attr.sender as ParserOptions['sender']), id: 'null', skip: false, message: cmd, parameters: attr.param ?? '', processedCommands: attr.processedCommands, parser: new Parser(), isAction: false,  emotesOffsets: new Map(), discord: undefined, isParserOptions: true,
      });
    }
    // run alias
    if (alias.enabled) {
      await alias.run({
        sender: (attr.sender as ParserOptions['sender']), id: 'null', skip: false, message: cmd, parameters: attr.param ?? '', parser: new Parser(), isAction: false,  emotesOffsets: new Map(), discord: undefined, isParserOptions: true,
      });
    }
    await new Parser().command(attr.sender, cmd, true);
    // we are not sending back any responses!
    return '';
  },
  '(!#)': async (filter: string, attr) => {
    const cmd = filter
      .replace(/\(|\)/g, '')
      .replace(/\$param/g, attr.param ?? '');
    debug('message.process', cmd);

    // check if we already checked cmd
    if (!attr.processedCommands) {
      attr.processedCommands = [];
    }
    if (attr.processedCommands.includes(cmd)) {
      error(`Response ${filter} seems to be in loop! ${attr.processedCommands.join('->')}->${attr.command}`);
      debug('message.error', `Response ${filter} seems to be in loop! ${attr.processedCommands.join('->')}->${attr.command}`);
      return '';
    } else {
      attr.processedCommands.push(attr.command);
    }

    // run custom commands
    if (customcommands.enabled) {
      await customcommands.run({
        sender: (attr.sender as ParserOptions['sender']), id: 'null', skip: false, message: cmd, parameters: attr.param ?? '', processedCommands: attr.processedCommands, parser: new Parser(), isAction: false,  emotesOffsets: new Map(), discord: undefined, isParserOptions: true,
      });
    }
    // run alias
    if (alias.enabled) {
      await alias.run({
        sender: (attr.sender as ParserOptions['sender']), id: 'null', skip: false, message: cmd, parameters: attr.param ?? '', parser: new Parser(), isAction: false, emotesOffsets: new Map(), discord: undefined, isParserOptions: true,
      });
    }
    const responses = await new Parser().command(attr.sender, cmd, true);
    for (let i = 0; i < responses.length; i++) {
      await parserReply(responses[i].response, { sender: responses[i].sender, discord: responses[i].discord, attr: responses[i].attr, id: '' });
    }
    return '';
  },
};

export { command };