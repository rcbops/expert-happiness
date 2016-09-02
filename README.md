# expert-happiness

expert-happiness is a jquery powered file for OpenStack Horizon that will allow you to place a help window on your
views allowing for context aware documentation for your cloud.

## Screen Shots
![shot1](http://i.imgur.com/qPxJAHm.png)

![shot2](http://i.imgur.com/wSukr0T.png)


## How It Works
expert-happiness works by using an ajax call to a remote web server to fetch in index.json file that you create. This
json file must contain a Catalog object. The Catalog object must contain a list of key value pairs. One key must be
`regex` and its value should be a valid regular expression. The next key must be `doc` and it should point to a document
on the Web Server that should be served should your current location in Horizon match the value in `regex`. For example
lets say your current location in Horizon is: `http://site.com/admin/instances` and you have your doc server running at:
`http://site.com:8000/`

In your `http://site.com:8000/index.json` you have the following entries:

```json
{"Catalog": [
    {
        "regex": "/admin/instances.*",
        "doc": "/admin/instances.html"
    },
    {
        "regex": "/project/instances.*",
        "doc": "/admin/instances.html"
    },
    {
        "regex": ".*",
        "doc": "/default.html"
    }
  ]
}
```
When you land on `http://site.com/admin/instances` the index.json is pulled first. Next it looks at your regular
expressions and finds one that matches. In this case the file: `http://site.com:8000/admin/instances.html` will be
loaded into the help info container. Regular expressions are matched in top down order. In this example above if you were
to visit: `http://site.com/admin/volumes` you would be served `http://site.com:8000/default.html` because it is a catch all
where anything would match. If you do not want a default page do not make a catch all regular expression.

## Documentation Server Setup

To setup expert-happiness you will need a web server to serve your documentation from. While possible it is not advised
to use the same server used to host Horizon to host your help docs. You will also need to be able to set the
`Access-Control-Allow-Origin` header on your content which will allow the content to be served using ajax. If you are
using Apache HTTPD the easiest way to set that header is using [mod_headers](http://httpd.apache.org/docs/current/mod/mod_headers.html).
Any Web Server can be used including lighttpd, nginx, httpd, or even IIS.


## expert-happiness Configuration

Very little is needed in this area. By default expert-happiness is only 1 file named double-cheeseburger.js It currently
only requires 1 variable be set in the file and that is:

```javascript
var info_site = "CHANGEME";
```
The value should be a full url. For example if you have the domain `site.com` and plan to run your documentation server
at `http://docs.site.com` then your variable should be:

```javascript
var info_site = "http://docs.site.com";
```

The value can also be an IP, but it still needs to be in URL format: `var info_site = "http://10.12.1.2";` Further configuration
can take place to adjust colors as well. To make adjustments to those values see the `helpInfoContainer()` function where
those variables are defined.


## Installing Into Horizon

Here you have several options. I will discuss the 2 options I use. First will be use on DevStack, and second will be using
OpenStack-Ansible (aka [osa](https://github.com/openstack/openstack-ansible)). Before you follow all the install instructions
be sure to configure the `var info_site` variable mentioned above. Failure to configure that variable will result in a
non functional help info box because it will never be able to pull docs.


### DevStack

To install using DevStack do the following as the stack user:

    cd ~/
    git clone https://github.com/michaelrice/expert-happiness
    cd /opt/stack/horizon/openstack_dashboard/static/dashboard
    mkdir js
    cd js
    cp ~/expret-happiness/js/*.js .
    cd /opt/stack/horizon
    python manage.py collectstatic --noinput
    python manage.py compress
    sudo service apache2 restart

This should give you a functional DevStack. This method will work on Liberty and newer, and possibly even on older

### OSA

To install using OSA you will need at least Mitaka because in previous versions there was no way to add custom files. If
you need to install this on Liberty or older it will be a manual process which is beyond the scope of this help doc.

    cd /opt
    git clone https://github.com/michaelrice/expert-happiness

Next edit your `user_variables.yml` file and add the following:

    horizon_custom_uploads:
      cheeseburger:
        src: /opt/expert-happiness/js
        dest: .

Finally save the file and re-run the os_horizon playbook

    cd /opt/openstack-ansible/playbooks
    openstack-ansible os_horizon
