#!/usr/bin/env sh

replacementString='';
#replacementString='s,API_BASE_URL,'"$API_BASE_URL"',g';
nginxConfReplacementString='';
nginxConfPath='/etc/nginx/nginx.conf';

escapeHtml() {
    # Replace reserved by HTML/sed characters with their HTML-codes.
    # Needed, because their usage lead to deploy failure (BA-38007).
    if [ -n "$1" ]
    then
        echo "$1" |
        sed -e 's/&/&amp;/g'                  | # ampersand, should be replaced first
        sed -e 's/</\&lt;/g'                  | # 'less-than' sign
        sed -e 's/>/\&gt;/g'                  | # 'greater-than' sign
        sed -e "$(printf 's/'\''/\&apos;/g')" | # single quote
        sed -e 's/"/\&quot;/g'                | # double quote
        sed -e "$(printf 's/{/\&#123;/g')"    | # figure brackets
        sed -e "$(printf 's/}/\&#125;/g')"    |
        sed -e 's/\[/\&#91;/g'                | # square brackets
        sed -e 's/\]/\&#93;/g'                |
        sed -e 's/(/\&#40;/g'                 | # parentheses
        sed -e 's/)/\&#41;/g'                 | # parentheses
        sed -e 's/\\/\&#92;/g'                | # backslash
        sed -e 's/\//\&#47;/g'                | # slash
        sed -e 's/+/\&#43;/g'                 | # plus sign
        sed -e 's/?/\&#63;/g'                 | # question mark
        sed -e "$(printf 's/|/\&#124;/g')"    ; # pipe
    fi
}

handle_logo() {
    # If either logo format or logo base64 string not passed, use default logo.
    if [ -z "$LOGO" ]
    then
        LOGO='PortaOne-brand-asset--logo-symbol.svg'
    else
        LOGO=$(echo 'mounted/'"$LOGO");
    fi

    replacementString=$(echo "$replacementString"';s#PortaOne-brand-asset--logo-symbol.svg#'"$LOGO"'#g');
}

handle_favicon() {
    if [ -z "$FAVICON" ]
    then
        FAVICON='favicon.ico'
    else
        FAVICON=$(echo 'mounted/'"$FAVICON");
    fi

    replacementString=$(echo "$replacementString"';s#favicon.ico#'"$FAVICON"'#g');
}


handle_author_name() {
    if [ -z "$BLOG_AUTHOR_NAME" ]
    then
        BLOG_AUTHOR_NAME='CloudPBX Author'
    else
        BLOG_AUTHOR_NAME=$(echo $(escapeHtml "$BLOG_AUTHOR_NAME") | sed -e 's/[&;,!]/\\&/g');
    fi

    replacementString=$(echo "$replacementString"';s,BLOG_AUTHOR_NAME,'"$BLOG_AUTHOR_NAME"',g');
    echo $replacementString
}

handle_customer_github() {
    if [ -n "$CUSTOMER_GITHUB" ]; then
        CUSTOMER_GITHUB=$(echo "$CUSTOMER_GITHUB" | sed -e 's/[&;,!]/\\&/g')
        replacementString=$(echo "$replacementString"';s#https://github.com/portaone#'"$CUSTOMER_GITHUB"'#g')
    fi

    echo $replacementString
}

handle_company_name() {
    if [ -n "$COMPANY_NAME" ]; then
        COMPANY_NAME=$(echo "$COMPANY_NAME" | sed -e 's/[&;,!]/\\&/g')
        replacementString=$(echo "$replacementString"';s#PortaOne, Inc.#'"$COMPANY_NAME"'#g')
    fi

    echo $replacementString
}

handle_company_linkedin() {
    if [ -n "$COMPANY_LINKEDIN" ]; then
        COMPANY_LINKEDIN=$(echo "$COMPANY_LINKEDIN" | sed -e 's/[&;,!]/\\&/g')
        replacementString=$(echo "$replacementString"';s#https://www.linkedin.com/company/portaone/#'"$COMPANY_LINKEDIN"'#g')
    fi

    echo $replacementString
}

handle_company_youtube() {
    if [ -n "$COMPANY_YOUTUBE" ]; then
        COMPANY_LINKEDIN=$(echo "$COMPANY_YOUTUBE" | sed -e 's/[&;,!]/\\&/g')
        replacementString=$(echo "$replacementString"';s#https://www.youtube.com/@PortaOne/#'"$COMPANY_YOUTUBE"'#g')
    fi

    echo $replacementString
}

handle_company_twitter() {
    if [ -n "$COMPANY_TWITTER" ]; then
        COMPANY_LINKEDIN=$(echo "$COMPANY_TWITTER" | sed -e 's/[&;,!]/\\&/g')
        replacementString=$(echo "$replacementString"';s#https://twitter.com/PortaOne#'"$COMPANY_TWITTER"'#g')
    fi

    echo $replacementString
}

handle_company_blog() {
    if [ -n "$COMPANY_BLOG" ]; then
        COMPANY_LINKEDIN=$(echo "$COMPANY_BLOG" | sed -e 's/[&;,!]/\\&/g')
        replacementString=$(echo "$replacementString"';s#https://blog.portaone.com/#'"$COMPANY_BLOG"'#g')
    fi

    echo $replacementString
}



handle_base_path() {
    if [ -z "$BASE_PATH" ]
    then
        BASE_PATH='/'
    else
        BASE_PATH=$(echo '/'"$BASE_PATH"'/' | sed -E 's!/{2,}!/!g')
    fi

    #replacementString=$(echo "$replacementString"';s,BASE_PATH,'"$BASE_PATH"',g');
    nginxConfReplacementString='s,BASE_PATH,'"$BASE_PATH"',g';

    if [ "$BASE_PATH" = '/' ]
    then
        sed -i '35,41d' "$nginxConfPath";
    else
        location=$(echo "$BASE_PATH" | sed -E 's,/+$,,');
        nginxConfReplacementString=$(echo "$nginxConfReplacementString"';s,PATH_WITHOUT_END_SLASH,'"$location"',');
    fi

    # adjust nginx configuration
    sed -i -e "$nginxConfReplacementString" "$nginxConfPath";
}

# process variables values
handle_logo
handle_favicon
handle_author_name
handle_customer_github
handle_company_name
handle_company_linkedin
handle_company_twitter
handle_company_youtube
handle_company_blog
handle_base_path


# replace variables placeholders with their values
find '/usr/share/nginx/html' \( -name '*.js' -o -name '*.html' \) -exec sed -i -e "$replacementString" {} \;

# start nginx service
nginx -g "daemon off;"
