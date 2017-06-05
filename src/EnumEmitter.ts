﻿import { FileParser, CSharpEnum, CSharpEnumOption } from 'fluffy-spoon.javascript.csharp-parser';
import { StringEmitter } from './StringEmitter';
import { Logger } from './Logger';

export interface EnumEmitOptions {
	declare: boolean;
	strategy?: "default" | "string-union";
}

export class EnumEmitter {
	constructor(
		private stringEmitter: StringEmitter,
		private logger: Logger) {

	}

	private prepareOptions(options?: EnumEmitOptions) {
		if (!options) {
			options = {
				declare: true,
				strategy: "default"
			}
		}

		if (!options.strategy) {
			options.strategy = "default";
		}

		return options;
	}

	emitEnums(enums: CSharpEnum[], options?: EnumEmitOptions) {
		this.logger.log("Emitting enums", enums);

		options = this.prepareOptions(options);

		for (var enumObject of enums) {
			this.emitEnum(enumObject, options);
		}

		this.stringEmitter.removeLastNewLines();
	}

	emitEnum(enumObject: CSharpEnum, options?: EnumEmitOptions) {
		this.logger.log("Emitting enum", enumObject);

		options = this.prepareOptions(options);

		this.stringEmitter.writeIndentation();
		if (options.declare)
			this.stringEmitter.write("declare ");

		if (options.strategy === "default") {
			this.stringEmitter.write("enum");
		} else if (options.strategy === "string-union") {
			this.stringEmitter.write("type");
		}

		this.stringEmitter.write(" " + enumObject.name + " ");

		if (options.strategy === "default") {
			this.stringEmitter.write("{");
		} else if (options.strategy === "string-union") {
			this.stringEmitter.write("=");
		}

		this.stringEmitter.writeLine();
		this.stringEmitter.increaseIndentation();

		for (var option of enumObject.options)
			this.emitEnumOption(option, options);

		if (options.strategy === "default") {
			this.stringEmitter.removeLastCharacters(',');
		} else if (options.strategy === "string-union") {
			this.stringEmitter.removeLastCharacters(' |\n');
		}

		this.stringEmitter.decreaseIndentation();

		if (options.strategy === "default") {
			this.stringEmitter.writeLine("}");
		}

		this.stringEmitter.ensureLineSplit();
	}

	private emitEnumOption(
		option: CSharpEnumOption,
		options: EnumEmitOptions)
	{
		this.logger.log("Emitting enum option", option);
		if (options.strategy === "default") {
			this.stringEmitter.writeLine(option.name + " = " + option.value + ",");
		} else if (options.strategy === "string-union") {
			this.stringEmitter.writeLine("'" + option.name + "' |");
		}
	}
}