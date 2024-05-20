-- Create the trigger function for canteens
CREATE OR REPLACE FUNCTION update_updated_at_column_canteens()
RETURNS TRIGGER AS $$
BEGIN
  NEW.update_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger function to the canteens table
CREATE TRIGGER update_updated_at_canteens 
BEFORE UPDATE ON canteens
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column_canteens();

-- Create the trigger function for menus
CREATE OR REPLACE FUNCTION update_updated_at_column_menus()
RETURNS TRIGGER AS $$
BEGIN
  NEW.update_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger function to the menus table
CREATE TRIGGER update_updated_at_menus 
BEFORE UPDATE ON menus
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column_menus();