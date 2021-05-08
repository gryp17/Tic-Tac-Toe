module.exports = {
	root: true,
	env: {
		node: true
	},
	parser: 'babel-eslint',
	globals: {
		__static: true
	},
	rules: {
		'comma-dangle': ['error', 'never'],
		'space-before-blocks': ['error', 'always'],
		semi: [2, 'always'],
		indent: ['error', 'tab'],
		quotes: [2, 'single', { 'avoidEscape': true }],
	}
};
