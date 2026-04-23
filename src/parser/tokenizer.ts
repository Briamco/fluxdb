export enum TokenType {
  WORD,
  STRING,
  NUMBER,
  JSON,
  OPERATOR,
}

export interface Token {
  type: TokenType;
  value: unknown;
}

export class Tokenizer {
  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
      const char = input[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // JSON detection (starts with {)
      if (char === '{') {
        let count = 0;
        const start = i;
        for (; i < input.length; i++) {
          if (input[i] === '{') count++;
          if (input[i] === '}') count--;
          if (count === 0) {
            i++;
            break;
          }
        }
        const jsonStr = input.substring(start, i);
        try {
          tokens.push({ type: TokenType.JSON, value: JSON.parse(jsonStr) });
        } catch {
          throw new Error('Invalid JSON: ' + jsonStr);
        }
        continue;
      }

      // String detection (starts with " or ')
      if (char === '"' || char === "'") {
        const quoteType = char;
        const start = ++i;
        while (i < input.length && input[i] !== quoteType) {
          i++;
        }
        if (i >= input.length) throw new Error('Unterminated string');
        tokens.push({ type: TokenType.STRING, value: input.substring(start, i) });
        i++;
        continue;
      }

      // Operator detection
      if (/[><=]/.test(char)) {
        tokens.push({ type: TokenType.OPERATOR, value: char });
        i++;
        continue;
      }

      // Number detection
      if (/[0-9]/.test(char)) {
        const start = i;
        while (i < input.length && /[0-9.]/.test(input[i])) {
          i++;
        }
        const val = input.substring(start, i);
        tokens.push({ type: TokenType.NUMBER, value: Number(val) });
        continue;
      }

      // Word detection
      if (/[a-zA-Z0-9_:.\-]/.test(char)) {
        const start = i;
        while (i < input.length && /[a-zA-Z0-9_:.\-]/.test(input[i])) {
          i++;
        }
        const val = input.substring(start, i);
        tokens.push({ type: TokenType.WORD, value: val });
        continue;
      }

      throw new Error(`Unexpected character: ${char} at position ${i}`);
    }

    return tokens;
  }
}
