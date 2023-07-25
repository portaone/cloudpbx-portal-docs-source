find 'blog' \( -name '*.md' -o -name '*.mdx' \) -exec sed -i -e "s#authors: sat#authors: blog_author#g" {} \;
sed -i 's/\/cloudpbx-portal-docs\//\/BASE_PATH\//g' docusaurus.config.js
