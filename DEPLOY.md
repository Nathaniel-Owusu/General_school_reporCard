# Deployment Instructions (Hostinger)

To host this application on Hostinger while keeping your school data:

1. **Database Export**: Use the `actual_school_data.sql` file generated in the root directory.
2. **Database Import**: Import that SQL file into your Hostinger phpMyAdmin.
3. **Configuration**: Create `config/prod_config.php` on your Hostinger server with your live database credentials.
4. **Environment**: The system automatically detects when it is running on Hostinger vs Localhost.

See `hosting_deployment_guide.md` in the artifacts for more detailed steps.
