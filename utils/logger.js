import winston from 'winston'
const { format } = winston;
const { timestamp, combine, align, printf, splat, errors, colorize } = format;
const customFormat = combine(
	format(log => ({
		...log,
		level: log.level.toUpperCase(),
	}))(),
	timestamp({
		format: 'YYYY-MM-DD hh:mm:ss.SSS-A',
	}),
	splat(),
	colorize({ all: false }),
	// align(),
	errors(),
	printf(({ timestamp, level, message }) => {
		return `[${timestamp}] ${level} PID:${getPID(level)} : ${message}`;
	}),
);

const logger = winston.createLogger({
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	format: customFormat,
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			dirname: '../logs/',
			filename: 'application-logs.txt',
			format: winston.format.uncolorize(),
		}),
	],
});
function getPID(level) {
	level = level.length;
	return `[${process.pid}]${''.padEnd(15 - level, ' ')}`;
}
export default logger;